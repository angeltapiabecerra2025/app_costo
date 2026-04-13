import React from 'react';
import { Database, FileSpreadsheet, Download, Plus, Trash2 } from 'lucide-react';

const StructureManager = () => {
  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
           <div className="flex items-center gap-3 text-amber-600 mb-1">
              <Database size={24} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mantenedores</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 font-heading uppercase tracking-tight leading-none">Gestión de <span className="text-amber-600">Estructuras</span></h2>
           <p className="text-slate-500 font-bold opacity-70">Configura las plantillas y estructuras base para los reportes técnicos.</p>
        </div>

        <button className="bg-amber-600 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-600/20">
           <Plus size={18} strokeWidth={3} /> Nueva Estructura
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass bg-white p-8 border-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              <FileSpreadsheet className="text-slate-400" size={32} />
           </div>
           <p className="text-slate-500 font-extrabold uppercase text-[10px] tracking-widest">No hay estructuras personalizadas</p>
           <p className="text-slate-400 text-sm mt-2 font-medium">Las estructuras por defecto se cargan desde los archivos Excel.</p>
        </div>
      </div>
    </div>
  );
};

export default StructureManager;
