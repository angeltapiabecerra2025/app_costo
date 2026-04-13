import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  User, 
  Trash2,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { cn } from '../utils/cn';

const ProjectManager = ({ projects = [], onAddProject, onDeleteProject, onSelectProject, activeProjectId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', code: '', location: '' });

  const reportTypes = [
    "Informe de Costos",
    "Informe de Provisión de Finiquitos",
    "Informe Mensual",
    "Flujo de Obra",
    "Informe de Proyección de Ingreso",
    "Control de Estados de Pagos",
    "Estatus de Facturación",
    "Informe Fotográfico"
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.code) return;
    
    const project = {
      ...newProject,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reports: reportTypes.map((name, i) => ({
        id: i + 1,
        name,
        uploadedPeriods: [], // Array of YYYY-MM
      }))
    };
    
    onAddProject(project);
    setNewProject({ name: '', code: '', location: '' });
    setIsAdding(false);
  };

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
           <div className="flex items-center gap-3 text-blue-600 mb-1">
              <Building2 size={24} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gestión de Activos</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 font-heading uppercase tracking-tight leading-none">Mantenedor de <span className="text-blue-600">Obras</span></h2>
           <p className="text-slate-500 font-bold opacity-70">Administra tus proyectos y el flujo de los 8 informes técnicos obligatorios.</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
        >
          <Plus size={18} /> Nueva Obra
        </button>
      </div>

      {/* Add Project Modal/Form Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-8">
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-900 uppercase">Configurar Nueva Obra</h3>
               <p className="text-slate-500 text-sm font-medium italic">Define los parámetros base del proyecto.</p>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre de la Obra</label>
                <input 
                  autoFocus
                  required
                  placeholder="Ej: Edificio Central Panal"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código Interno</label>
                  <input 
                    required
                    placeholder="Ej: P-2024-05"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                    value={newProject.code}
                    onChange={e => setNewProject({...newProject, code: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ubicación / Ciudad</label>
                  <input 
                    placeholder="Ej: Santiago"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                    value={newProject.location}
                    onChange={e => setNewProject({...newProject, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-black px-8 py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20"
                >
                  Confirmar Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 gap-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-32 glass bg-white border-dashed border-2 border-slate-200 opacity-60">
             <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8">
                <Building2 size={32} className="text-slate-400" />
             </div>
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No hay obras registradas.</p>
             <p className="text-slate-400 text-sm mt-2 font-medium">Crea tu primera obra para comenzar a gestionar informes.</p>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id} 
              className={cn(
                "group glass bg-white p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col gap-8",
                activeProjectId === project.id 
                  ? "border-blue-500 shadow-2xl shadow-blue-600/5 ring-1 ring-blue-500/10" 
                  : "border-slate-100 hover:border-slate-300 shadow-sm"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300",
                    activeProjectId === project.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    <Building2 size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">{project.code}</span>
                      {activeProjectId === project.id && (
                        <span className="animate-pulse flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase">
                          <CheckCircle2 size={12} /> Activa ahora
                        </span>
                      )}
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none pt-1">{project.name}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
                       Ubicación: <span className="text-slate-600 underline underline-offset-4 decoration-slate-200">{project.location || 'No definida'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onDeleteProject(project.id)}
                    className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => onSelectProject(project.id)}
                    className={cn(
                      "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                      activeProjectId === project.id 
                        ? "bg-slate-900 text-white" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                    )}
                  >
                    {activeProjectId === project.id ? 'Obra Activa' : 'Seleccionar Obra'} <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Reports Checklist Mini-Dashboard */}
              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 grid grid-cols-4 gap-6">
                 {project.reports.map((report, idx) => {
                    const sortedPeriods = [...(report.uploadedPeriods || [])].sort().reverse();
                    const lastPeriod = sortedPeriods[0];
                    const isUpToDate = lastPeriod === new Date().toISOString().slice(0, 7);
                    
                    return (
                      <div key={idx} className="flex flex-col gap-2 relative group-item">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               {lastPeriod ? (
                                 <CheckCircle2 size={14} className="text-emerald-500" />
                               ) : (
                                 <Circle size={14} className="text-slate-300" />
                               )}
                               <span className={cn(
                                 "text-[9px] font-black uppercase tracking-tight truncate max-w-[120px]",
                                 lastPeriod ? "text-slate-900" : "text-slate-400"
                               )}>
                                 {report.name}
                               </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                             <span className={cn(
                               "text-[8px] font-bold uppercase",
                               lastPeriod ? "text-emerald-600" : "text-amber-500"
                             )}>
                               {lastPeriod ? `Subido: ${lastPeriod}` : 'Falta subir'}
                             </span>
                             {lastPeriod && (
                               <span className="text-[7px] font-black text-slate-300 uppercase italic">
                                 {sortedPeriods.length} reg.
                               </span>
                             )}
                          </div>

                          <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                             <div className={cn(
                               "h-full transition-all duration-500",
                               lastPeriod ? "w-full bg-emerald-500" : "w-1 bg-slate-300"
                             )}></div>
                          </div>
                      </div>
                    );
                 })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
