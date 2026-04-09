export default function Home() {
  return (
    <div className="flex flex-col gap-12 max-w-3xl">
      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Atomos Structura</h1>
        <p className="text-lg text-slate-400 font-light leading-relaxed">
          High-performance, headless graph modeling interface connected through standard ISO architectures and Model Context Protocol.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">1</span> 
          Decoupled DOM & Data
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <p className="text-slate-300 leading-7 relative z-10 text-[15px]">
            The exact same abstract syntax tree is parsed by a headless Node.js testing environment and the browser's DOM renderer. Nothing is tightly coupled to HTML. Every schema node is a pure Redux Entity mapped to a Web Component through declarative adapters.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="/headless" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">Read Headless Docs</a>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-3">
          <span className="inline-block w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">2</span> 
          Model Context Protocol (MCP)
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/4 -translate-x-1/4"></div>
          <p className="text-slate-300 leading-7 relative z-10 text-[15px]">
            Two-way data binding with AI systems via standard MCP JSON-RPC. A sidecar server translates AST modifications from local and remote LLMs directly into the canvas. Live collaborative intelligence.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="/mcp" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">Explore MCP Specs</a>
          </div>
        </div>
      </section>
    </div>
  );
}
