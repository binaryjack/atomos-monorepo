import type { NeuraNode, NeuraEdge, NeuraViewport } from '../core/neura-store.js';

const nodeVertexShaderSource = `
  attribute vec2 a_position;
  attribute vec3 a_color;
  attribute float a_size;
  
  uniform vec2 u_resolution;
  uniform vec2 u_translation;
  uniform float u_zoom;

  varying vec3 v_color;

  void main() {
    // Apply pan and zoom
    vec2 position = (a_position + u_translation) * u_zoom;
    
    // Convert from pixel space to clip space (-1.0 to 1.0)
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // WebGL Y is flipped
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
    // Size is scaled by zoom
    gl_PointSize = a_size * u_zoom;
    
    v_color = a_color;
  }
`;

const nodeFragmentShaderSource = `
  precision mediump float;
  varying vec3 v_color;

  void main() {
    // Draw a circle instead of a square
    vec2 coord = gl_PointCoord - vec2(0.5);
    if(length(coord) > 0.5) {
      discard;
    }
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

const edgeVertexShaderSource = `
  attribute vec2 a_position;
  
  uniform vec2 u_resolution;
  uniform vec2 u_translation;
  uniform float u_zoom;

  void main() {
    vec2 position = (a_position + u_translation) * u_zoom;
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;

const edgeFragmentShaderSource = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.3, 0.3, 0.3, 0.5); // Grayish semi-transparent lines
  }
`;

export class WebGLEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  
  private nodeProgram: WebGLProgram | null = null;
  private nodePositionBuffer: WebGLBuffer | null = null;
  private nodeColorBuffer: WebGLBuffer | null = null;
  
  private edgeProgram: WebGLProgram | null = null;
  private edgePositionBuffer: WebGLBuffer | null = null;
  
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
    this.edgePositionBuffer = this.gl.createBuffer();
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

  public render(nodes: NeuraNode[], edges: NeuraEdge[], viewport: NeuraViewport) {
    if (!this.nodeProgram || !this.edgeProgram) return;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // --- RENDER EDGES ---
    this.gl.useProgram(this.edgeProgram);

    let eRes = this.gl.getUniformLocation(this.edgeProgram, "u_resolution");
    let eTrans = this.gl.getUniformLocation(this.edgeProgram, "u_translation");
    let eZoom = this.gl.getUniformLocation(this.edgeProgram, "u_zoom");

    this.gl.uniform2f(eRes, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(eTrans, viewport.x, viewport.y);
    this.gl.uniform1f(eZoom, viewport.zoom);

    // Build edge positions array
    const edgePositions = new Float32Array(edges.length * 4); // 2 vertices per edge, 2 coords per vertex
    
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
        edgeCount++;
      }
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.edgePositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, edgePositions, this.gl.DYNAMIC_DRAW);
    
    const ePosAttr = this.gl.getAttribLocation(this.edgeProgram, "a_position");
    this.gl.enableVertexAttribArray(ePosAttr);
    this.gl.vertexAttribPointer(ePosAttr, 2, this.gl.FLOAT, false, 0, 0);

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
    const colors = new Float32Array(nodes.length * 3);
    
    // Simple color hashing based on appartenanceId for demo
    const getColor = (id: string): [number, number, number] => {
      const hash = id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
      const r = ((hash >> 16) & 0xFF) / 255;
      const g = ((hash >> 8) & 0xFF) / 255;
      const b = (hash & 0xFF) / 255;
      // Boost brightness for nodes to pop against dark background
      return [Math.min(1.0, r + 0.3), Math.min(1.0, g + 0.3), Math.min(1.0, b + 0.3)];
    };

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      positions[i * 2] = node.x;
      positions[i * 2 + 1] = node.y;
      
      const [r, g, b] = getColor(node.appartenanceId);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
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
    this.gl.vertexAttribPointer(aColor, 3, this.gl.FLOAT, false, 0, 0);

    // Size attribute based on zoom
    const aSize = this.gl.getAttribLocation(this.nodeProgram, "a_size");
    // Ensure dots don't get impossibly small or massively huge
    let clampedZoom = Math.max(0.5, Math.min(viewport.zoom, 5.0));
    this.gl.vertexAttrib1f(aSize, 6.0 / clampedZoom); 

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
