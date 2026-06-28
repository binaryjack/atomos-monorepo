import type { NeuraNode, NeuraEdge, NeuraViewport } from '../core/neura-store.js';

const nodeVertexShaderSource = `
  attribute vec2 a_position;
  attribute vec4 a_color;
  attribute float a_size_attr;
  
  uniform vec2 u_resolution;
  uniform vec2 u_translation;
  uniform float u_zoom;

  varying vec4 v_color;

  void main() {
    // Apply pan and zoom
    vec2 position = (a_position + u_translation) * u_zoom;
    
    // Convert from pixel space to clip space (-1.0 to 1.0)
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // WebGL Y is flipped
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
    // Size is scaled by zoom and by the node's weight score
    float clampedZoom = max(0.5, min(u_zoom, 5.0));
    gl_PointSize = (10.0 + (a_size_attr * 30.0)) / clampedZoom;
    
    v_color = a_color;
  }
`;

const nodeFragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    // Draw a circle instead of a square
    vec2 coord = gl_PointCoord - vec2(0.5);
    if(length(coord) > 0.5) {
      discard;
    }
    gl_FragColor = v_color;
  }
`;

const edgeVertexShaderSource = `
  attribute vec2 a_position;
  attribute vec4 a_color;
  
  uniform vec2 u_resolution;
  uniform vec2 u_translation;
  uniform float u_zoom;

  varying vec4 v_color;
  varying vec2 v_world_pos;

  void main() {
    vec2 position = (a_position + u_translation) * u_zoom;
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
    v_color = a_color;
    v_world_pos = a_position;
  }
`;

const edgeFragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color;
  varying vec2 v_world_pos;
  uniform float u_time;
  
  void main() {
    float pulse = 0.5 + 0.5 * sin(u_time * 4.0 + (v_world_pos.x + v_world_pos.y) * 0.05);
    gl_FragColor = vec4(v_color.rgb, v_color.a * (0.6 + 0.4 * pulse)); 
  }
`;

export class WebGLEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  
  private nodeProgram: WebGLProgram | null = null;
  private nodePositionBuffer: WebGLBuffer | null = null;
  private nodeColorBuffer: WebGLBuffer | null = null;
  private nodeSizeBuffer: WebGLBuffer | null = null;
  
  private edgeProgram: WebGLProgram | null = null;
  private edgePositionBuffer: WebGLBuffer | null = null;
  private edgeColorBuffer: WebGLBuffer | null = null;
  
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: true }) || canvas.getContext('webgl', { antialias: true });
    if (!gl) {
      throw new Error('WebGL is not supported by your browser.');
    }
    this.gl = gl;
    this.init();
  }

  private init() {
    this.gl.clearColor(0.05, 0.05, 0.08, 1.0); // Dark background
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.nodeProgram = this.createProgram(nodeVertexShaderSource, nodeFragmentShaderSource);
    if (!this.nodeProgram) throw new Error("Failed to create node program");

    this.edgeProgram = this.createProgram(edgeVertexShaderSource, edgeFragmentShaderSource);
    if (!this.edgeProgram) throw new Error("Failed to create edge program");

    this.nodePositionBuffer = this.gl.createBuffer();
    this.nodeColorBuffer = this.gl.createBuffer();
    this.nodeSizeBuffer = this.gl.createBuffer();
    this.edgePositionBuffer = this.gl.createBuffer();
    this.edgeColorBuffer = this.gl.createBuffer();
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error(this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  public render(nodes: NeuraNode[], edges: NeuraEdge[], viewport: NeuraViewport, activeNodeIds: Set<string>, activeEdgeIds: Set<string>, hasActiveFocus: boolean) {
    if (!this.nodeProgram || !this.edgeProgram) return;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // --- RENDER EDGES ---
    this.gl.useProgram(this.edgeProgram);

    let eRes = this.gl.getUniformLocation(this.edgeProgram, "u_resolution");
    let eTrans = this.gl.getUniformLocation(this.edgeProgram, "u_translation");
    let eZoom = this.gl.getUniformLocation(this.edgeProgram, "u_zoom");
    let eTime = this.gl.getUniformLocation(this.edgeProgram, "u_time");

    this.gl.uniform2f(eRes, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(eTrans, viewport.x, viewport.y);
    this.gl.uniform1f(eZoom, viewport.zoom);
    this.gl.uniform1f(eTime, performance.now() / 1000.0);

    // Build edge positions array
    const edgePositions = new Float32Array(edges.length * 4); // 2 vertices per edge, 2 coords per vertex
    const edgeColors = new Float32Array(edges.length * 8); // 2 vertices per edge, 4 coords (rgba)
    
    // Create a lookup for node positions to avoid O(N) find
    const nodeLookup = new Map<string, NeuraNode>();
    for (const node of nodes) {
      nodeLookup.set(node.id, node);
    }

    let edgeCount = 0;
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]!;
      const source = nodeLookup.get(edge.sourceId);
      const target = nodeLookup.get(edge.targetId);
      if (source && target) {
        edgePositions[edgeCount * 4] = source.x;
        edgePositions[edgeCount * 4 + 1] = source.y;
        edgePositions[edgeCount * 4 + 2] = target.x;
        edgePositions[edgeCount * 4 + 3] = target.y;
        
        let r = 0.3, g = 0.3, b = 0.3, a = 0.5;
        if (hasActiveFocus) {
          if (activeEdgeIds.has(edge.id)) {
            r = 0.8; g = 0.8; b = 1.0; a = 0.9; // Highlight color
          } else {
            a = 0.05; // Fade out inactive edges heavily
          }
        }
        
        // Vert 1
        edgeColors[edgeCount * 8] = r; edgeColors[edgeCount * 8 + 1] = g; edgeColors[edgeCount * 8 + 2] = b; edgeColors[edgeCount * 8 + 3] = a;
        // Vert 2
        edgeColors[edgeCount * 8 + 4] = r; edgeColors[edgeCount * 8 + 5] = g; edgeColors[edgeCount * 8 + 6] = b; edgeColors[edgeCount * 8 + 7] = a;
        
        edgeCount++;
      }
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.edgePositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, edgePositions, this.gl.DYNAMIC_DRAW);
    const ePosAttr = this.gl.getAttribLocation(this.edgeProgram, "a_position");
    this.gl.enableVertexAttribArray(ePosAttr);
    this.gl.vertexAttribPointer(ePosAttr, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.edgeColorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, edgeColors, this.gl.DYNAMIC_DRAW);
    const eColorAttr = this.gl.getAttribLocation(this.edgeProgram, "a_color");
    this.gl.enableVertexAttribArray(eColorAttr);
    this.gl.vertexAttribPointer(eColorAttr, 4, this.gl.FLOAT, false, 0, 0);

    // Draw lines
    this.gl.drawArrays(this.gl.LINES, 0, edgeCount * 2);

    // --- RENDER NODES ---
    this.gl.useProgram(this.nodeProgram);

    // Uniforms
    const uResolution = this.gl.getUniformLocation(this.nodeProgram, "u_resolution");
    const uTranslation = this.gl.getUniformLocation(this.nodeProgram, "u_translation");
    const uZoom = this.gl.getUniformLocation(this.nodeProgram, "u_zoom");

    this.gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(uTranslation, viewport.x, viewport.y);
    this.gl.uniform1f(uZoom, viewport.zoom);

    // Setup attribute arrays
    const positions = new Float32Array(nodes.length * 2);
    const colors = new Float32Array(nodes.length * 4); // RGBA
    const sizes = new Float32Array(nodes.length);
    
    // Simple color hashing based on appartenanceId for demo
    const getColor = (id: string): [number, number, number] => {
      const hash = id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
      const r = ((hash >> 16) & 0xFF) / 255;
      const g = ((hash >> 8) & 0xFF) / 255;
      const b = (hash & 0xFF) / 255;
      return [r, g, b];
    };

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      positions[i * 2] = node.x;
      positions[i * 2 + 1] = node.y;
      
      const [r, g, b] = getColor(node.appartenanceId);
      
      // Calculate opacity and brightness based on weight (score)
      let brightness = 0.5 + (node.weight * 0.7); // Brightens highly attractive nodes
      let opacity = 0.2 + (node.weight * 0.8); // 0.2 to 1.0 opacity
      
      if (hasActiveFocus) {
        if (activeNodeIds.has(node.id)) {
          brightness = 1.0;
          opacity = 1.0;
        } else {
          opacity = 0.05; // Fade out inactive nodes heavily
          brightness *= 0.5;
        }
      }
      
      colors[i * 4] = Math.min(1.0, r * brightness);
      colors[i * 4 + 1] = Math.min(1.0, g * brightness);
      colors[i * 4 + 2] = Math.min(1.0, b * brightness);
      colors[i * 4 + 3] = opacity;
      
      sizes[i] = node.weight;
    }

    // Bind Position Buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodePositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.DYNAMIC_DRAW);
    const aPosition = this.gl.getAttribLocation(this.nodeProgram, "a_position");
    this.gl.enableVertexAttribArray(aPosition);
    this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);

    // Bind Color Buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeColorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.DYNAMIC_DRAW);
    const aColor = this.gl.getAttribLocation(this.nodeProgram, "a_color");
    this.gl.enableVertexAttribArray(aColor);
    this.gl.vertexAttribPointer(aColor, 4, this.gl.FLOAT, false, 0, 0);
    
    // Bind Size Buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeSizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, sizes, this.gl.DYNAMIC_DRAW);
    const aSizeAttr = this.gl.getAttribLocation(this.nodeProgram, "a_size_attr");
    this.gl.enableVertexAttribArray(aSizeAttr);
    this.gl.vertexAttribPointer(aSizeAttr, 1, this.gl.FLOAT, false, 0, 0);

    // Draw
    this.gl.drawArrays(this.gl.POINTS, 0, nodes.length);
  }

  public startLoop(renderCallback: () => void) {
    const loop = () => {
      renderCallback();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy() {
    this.stopLoop();
    if (this.nodeProgram) this.gl.deleteProgram(this.nodeProgram);
    if (this.nodePositionBuffer) this.gl.deleteBuffer(this.nodePositionBuffer);
    if (this.nodeColorBuffer) this.gl.deleteBuffer(this.nodeColorBuffer);
  }
}
