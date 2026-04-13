import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';
import { cn } from '../App';

const SheetTabs = ({ sheets, activeSheet, onSheetChange }) => {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
      {sheets.map((sheet) => (
        <button
          key={sheet}
          onClick={() => onSheetChange(sheet)}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
            activeSheet === sheet 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
              : "bg-white text-slate-400 hover:text-slate-900 border border-slate-200"
          )}
        >
          {sheet}
        </button>
      ))}
    </div>
  );
};

const ReportHeader = ({ title, status, project, onStatusChange }) => {
  const statusColors = {
    'BORRADOR': 'bg-slate-700 text-white',
    'EN_REVISION': 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
    'APROBADO': 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30',
    'RECHAZADO': 'bg-red-500/20 text-red-500 border border-red-500/30',
  };

  return (
    <div className="flex justify-between items-start mb-8 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className={cn("px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase", statusColors[status])}>
            {status}
          </span>
          <span className="text-slate-300 font-bold">•</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project}</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900 font-heading tracking-tight">{title}</h2>
      </div>
      
      <div className="flex gap-3">
         {status === 'BORRADOR' && (
           <button 
             onClick={() => onStatusChange('EN_REVISION')}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/10"
           >
             Enviar a Revisión <ArrowRight size={16} />
           </button>
         )}
         {status === 'EN_REVISION' && (
           <>
             <button 
               onClick={() => onStatusChange('RECHAZADO')}
               className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border border-red-500/20"
             >
               Rechazar
             </button>
             <button 
               onClick={() => onStatusChange('APROBADO')}
               className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/10"
             >
               Aprobar Informe
             </button>
           </>
         )}
         {(status === 'APROBADO' || status === 'RECHAZADO') && (
            <button 
              onClick={() => onStatusChange('BORRADOR')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              Volver a Borrador (Editar)
            </button>
         )}
      </div>
    </div>
  );
};

const HierarchicalTable = ({ data = [] }) => {
  const [expandedGroups, setExpandedGroups] = useState([]);

  const toggleGroup = (id) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="glass p-20 text-center text-slate-500 italic">
        No hay datos disponibles en esta hoja.
      </div>
    );
  }

  // Use headers from the first valid row if available, otherwise default
  const headers = [
    "Descripción de Partida", "Unidad", "Cantidad", "Costo Unit.", "Total Real", "Costo Proy.", "Desviación"
  ];

  return (
    <div className="glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="cost-table">
          <thead>
            <tr>
              {headers.map((h, i) => <th key={i}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isExpanded = expandedGroups.includes(row.id);
              const isGroup = row.type === 'group';
              const isVisible = !row.parent || expandedGroups.includes(row.parent);

              if (!isVisible) return null;

              return (
                <tr key={row.id} className={cn(isGroup ? "row-group" : "")}>
                  <td className="flex items-center gap-2 min-w-[300px]">
                    {isGroup && (
                      <button onClick={() => toggleGroup(row.id)} className="text-blue-600 hover:text-blue-700 transition-colors">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    )}
                    {!isGroup && <div className="w-5" />}
                    <span className={cn("uppercase tracking-tight", isGroup ? "text-blue-700 font-black text-[13px]" : "text-slate-600 font-bold text-[12px]")}>{row.label}</span>
                  </td>
                  {row.values.slice(0, headers.length - 1).map((v, i) => (
                    <td key={i} className={cn(
                      "text-slate-500 text-right font-mono text-[11px] font-bold",
                      String(v).startsWith('-') && "text-red-500 font-black",
                      String(v).startsWith('+') && "text-emerald-600 font-black"
                    )}>
                      {v}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExcelReportView = ({ projectData, status, onStatusChange }) => {
  const [activeSheet, setActiveSheet] = useState('Matriz de Resultados');
  const sheets = Object.keys(projectData?.sheets || {});
  const currentSheetData = projectData?.sheets?.[activeSheet] || [];

  return (
    <div className="app-page">
      <ReportHeader 
        title={projectData?.fileName || "Informe Mensual de Costos"} 
        status={status} 
        project={projectData?.metadata?.project || "EIMI00398 - PROYECTO ANA MARÍA"} 
        onStatusChange={onStatusChange}
      />
      
      <SheetTabs 
        sheets={sheets} 
        activeSheet={activeSheet} 
        onSheetChange={setActiveSheet} 
      />

      <div className="mb-6 grid grid-cols-4 gap-4">
         <div className="bg-blue-50 border border-blue-100 p-6 rounded-[1.5rem] shadow-sm">
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Margen Real</p>
           <p className="text-2xl font-black text-slate-900 leading-none">14.2%</p>
         </div>
         <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[1.5rem] shadow-sm">
           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Producción Acum.</p>
           <p className="text-2xl font-black text-slate-900 leading-none">$1.458.200</p>
         </div>
         <div className="bg-red-50 border border-red-100 p-6 rounded-[1.5rem] shadow-sm">
           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Costo Real</p>
           <p className="text-2xl font-black text-slate-900 leading-none">$1.250.000</p>
         </div>
         <div className="bg-purple-50 border border-purple-100 p-6 rounded-[1.5rem] shadow-sm">
           <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Diferencia Proy.</p>
           <p className="text-2xl font-black text-slate-900 leading-none">-$45.200</p>
         </div>
      </div>

      <HierarchicalTable data={currentSheetData} />
      
      <div className="mt-8 p-6 glass border-l-4 border-l-blue-600">
        <h4 className="text-slate-900 font-black mb-4 flex items-center gap-3 uppercase tracking-tighter">
          <Layers size={20} className="text-blue-600" /> Notas del Informe
        </h4>
        <textarea 
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
          placeholder="Agrega comentarios sobre las desviaciones de este mes..."
          rows={4}
        />
      </div>
    </div>
  );
};

export default ExcelReportView;
