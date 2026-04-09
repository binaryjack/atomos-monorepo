const fs = require('fs');
const path = require('path');
const types = [
  {id: 'class-diagram', title: 'Class Diagram', desc: 'Visual representation of object-oriented classes and their relationships.'},
  {id: 'cqrs', title: 'CQRS Architecture', desc: 'Command Query Responsibility Segregation data flow diagram.'},
  {id: 'mvvm', title: 'MVVM Architecture', desc: 'Model-View-ViewModel architectural pattern representation.'},
  {id: 'mvc', title: 'MVC Architecture', desc: 'Model-View-Controller design pattern structure.'},
  {id: 'uml', title: 'UML Diagram', desc: 'General Unified Modeling Language structures and behaviors.'},
  {id: 'flux', title: 'FLUX Diagram', desc: 'Unidirectional data flow paradigm for UI applications.'},
  {id: 'database', title: 'Database Diagram', desc: 'Entity-Relationship schema and database structures.'},
  {id: 'activity-workflow', title: 'Activity Workflow', desc: 'Business process, control flow, and activity diagrams.'},
  {id: 'security-schema', title: 'Security Schema', desc: 'Authentication, authorization, and network security boundaries.'}
];

const template = (t) => `import { CanvasSandbox } from "../../../components/CanvasSandboxWrapper";

export default function ${t.id.replace(/-/g, '')}Page() {
  return (
    <div className="flex flex-col gap-10 max-w-4xl w-full h-full pb-10">
      <header className="border-b border-slate-800 pb-8 shrink-0">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">${t.title}</h1>
        <p className="text-slate-400 leading-relaxed text-lg">${t.desc}</p>
      </header>

      <section className="flex flex-col flex-1 h-[700px] min-h-[500px]">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live ${t.title}
          </h2>
        </div>
        <div className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden relative shadow-2xl min-h-[500px]">
          <CanvasSandbox preset="${t.id}" />
        </div>
      </section>
    </div>
  )
}
`;

types.forEach(t => {
  const dir = path.join('packages', 'showcase', 'src', 'app', 'architectures', t.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(t));
});
