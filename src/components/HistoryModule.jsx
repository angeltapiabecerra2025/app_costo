import React from 'react';
import { 
  History, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  Calendar, 
  Building2, 
  Database,
  ArrowRight,
  FileText
} from 'lucide-react';
import { cn } from '../utils/cn';

const HistoryModule = ({ reports = [], projects = [], onLoadReport, onDeleteReport, onExportJSON, onImportJSON }) => {
  const [filterProject, setFilterProject] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');

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

  const filteredReports = reports.filter(r => {
    const matchProj = filterProject === 'all' || r.projectId === filterProject;
    const matchType = filterType === 'all' || r.reportType === filterType;
    return matchProj && matchType;
  });

  const sortedReports = [...filteredReports].sort((a, b) => new Date(b.period) - new Date(a.period));

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
           <div className="flex items-center gap-3 text-blue-600 mb-1">
              <History size={24} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Centro de Gestión</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 font-heading uppercase tracking-tight leading-none">Historial de <span className="text-blue-600">Análisis</span></h2>
           <p className="text-slate-500 font-bold opacity-70">Gestiona, respalda y recupera tus cierres mensuales procesados.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 flex items-center gap-6 px-4">
              <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
                <Building2 size={16} className="text-slate-400" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Filtrar por Obra</span>
                   <select 
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      className="bg-transparent text-[11px] font-black text-slate-900 outline-none uppercase cursor-pointer"
                   >
                      <option value="all">TODAS LAS OBRAS</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText size={16} className="text-slate-400" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tipo de Informe</span>
                   <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-transparent text-[11px] font-black text-slate-900 outline-none uppercase cursor-pointer"
                   >
                      <option value="all">TODOS LOS TIPOS</option>
                      {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
              </div>
           </div>

           <button 
             onClick={onExportJSON}
             className="bg-white border border-slate-200 text-slate-700 font-black px-6 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
           >
             <Download size={16} /> Respaldar Historial (JSON)
           </button>
           <button 
             onClick={onImportJSON}
             className="bg-blue-600 text-white font-black px-6 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
           >
             <Upload size={16} /> Restaurar de JSON
           </button>
        </div>
      </div>

      {sortedReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-32 glass bg-white border-dashed border-2 border-slate-200 opacity-60">
           <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-200">
              <Database size={32} className="text-slate-400" />
           </div>
           <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No hay registros que coincidan con los filtros.</p>
           <p className="text-slate-400 text-sm mt-2 font-medium">Ajusta los selectores superiores o carga un nuevo informe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedReports.map((report) => (
            <div 
              key={report.id} 
              className="group glass bg-white p-6 border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-8">
                 <div className="flex flex-col items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                    <Calendar size={20} className="text-blue-600 group-hover:text-white transition-colors mb-1" />
                    <span className="text-[10px] font-black text-blue-800 group-hover:text-white uppercase leading-none">
                      {new Date(report.period + '-02').toLocaleDateString('es-CL', { month: 'short' })}
                    </span>
                    <span className="text-[10px] font-black text-blue-800 group-hover:text-white uppercase mt-0.5">
                      {new Date(report.period + '-02').getFullYear()}
                    </span>
                 </div>

                 <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                       <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{report.reportType || 'SIN TIPO'}</p>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <p className="text-[10px] font-bold text-slate-500 uppercase">Guardado: {new Date(report.saveDate).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <Building2 size={18} className="text-slate-400" />
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{projects.find(p => p.id === report.projectId)?.name || 'Obra Desconocida'}</h4>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                       <Database size={14} className="text-slate-500" />
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Archivo: {report.fileName}</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => onDeleteReport(report.id)}
                   className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95"
                 >
                   <Trash2 size={20} />
                 </button>
                 <button 
                   onClick={() => onLoadReport(report)}
                   className="flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest group-hover:translate-x-[-8px] transition-all duration-300 shadow-lg active:scale-95"
                 >
                   Ver Análisis <ArrowRight size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryModule;
