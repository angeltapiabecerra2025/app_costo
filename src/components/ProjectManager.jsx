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

const ProjectManager = ({ projects = [], onAddProject, onDeleteProject, onUpdateProject, onSelectProject, activeProjectId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', code: '', location: '', startDate: '', endDate: '' });

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
        uploadedPeriods: [],
      }))
    };
    
    onAddProject(project);
    setNewProject({ name: '', code: '', location: '', startDate: '', endDate: '' });
    setIsAdding(false);
  };

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
           <div className="flex items-center gap-3 text-rose-600 mb-1">
              <Building2 size={24} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gestión de Activos</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 font-heading uppercase tracking-tight leading-none">Gestión de <span className="text-rose-600">Obras</span></h2>
           <p className="text-slate-500 font-bold opacity-70">Administra tus proyectos, define sus fechas y abreviaturas oficiales.</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="bg-rose-600 text-white font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-rose-600/20"
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
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Abreviatura / Código</label>
                  <input 
                    required
                    placeholder="Ej: PANAL"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                    value={newProject.code}
                    onChange={e => setNewProject({...newProject, code: e.target.value})}
                  />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha de Inicio</label>
                  <input 
                    type="month"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                    value={newProject.startDate}
                    onChange={e => setNewProject({...newProject, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha de Término</label>
                  <input 
                    type="month"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                    value={newProject.endDate}
                    onChange={e => setNewProject({...newProject, endDate: e.target.value})}
                  />
                </div>
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
                "group glass bg-white px-8 py-5 rounded-[2rem] border transition-all duration-500 flex items-center justify-between gap-8",
                activeProjectId === project.id 
                  ? "border-blue-500 shadow-2xl shadow-blue-600/5 ring-1 ring-blue-500/10" 
                  : "border-slate-100 hover:border-slate-300 shadow-sm"
              )}
            >
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0",
                  project.active !== false ? (activeProjectId === project.id ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600") : "bg-slate-100 text-slate-400"
                )}>
                  <Building2 size={20} />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                      project.active !== false ? "text-rose-600 bg-rose-50" : "text-slate-400 bg-slate-100"
                    )}>{project.code}</span>
                    {project.active === false && <span className="text-[8px] font-black text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">Desactivada</span>}
                    {activeProjectId === project.id && (
                      <span className="animate-pulse flex items-center gap-1.5 text-[8px] font-black text-emerald-600 uppercase">
                        <CheckCircle2 size={10} /> Activa ahora
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none truncate">{project.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                     {project.location || 'Chile'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-slate-50/50 py-3 px-6 rounded-2xl border border-slate-100 shrink-0">
                 <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Calendar size={14} className="text-slate-300" /> 
                    <span className="text-slate-700 font-black">{project.startDate || '---'} — {project.endDate || '---'}</span>
                 </p>
              </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onUpdateProject?.({...project, active: project.active !== false ? false : true})}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm",
                        project.active !== false 
                          ? "bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600 border border-emerald-100 hover:border-rose-100" 
                          : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                      )}
                    >
                      {project.active !== false ? 'Desactivar' : 'Activar'}
                    </button>
                    
                    <button 
                      onClick={() => onDeleteProject(project.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <button 
                      onClick={() => (project.active !== false) && onSelectProject(project.id)}
                      disabled={project.active === false}
                      className={cn(
                        "flex items-center gap-3 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                        project.active === false
                          ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
                          : activeProjectId === project.id 
                            ? "bg-slate-900 text-white shadow-slate-900/10" 
                            : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20"
                      )}
                    >
                      {activeProjectId === project.id ? 'Cargada' : 'Seleccionar'} <ArrowRight size={14} />
                    </button>
                  </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
