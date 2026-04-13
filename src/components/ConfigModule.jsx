import React from 'react';
import { Settings, Download, Upload, ShieldCheck, Database, Trash2 } from 'lucide-react';

const ConfigModule = ({ onExportJSON, onImportJSON }) => {
  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="space-y-2">
         <div className="flex items-center gap-3 text-slate-600 mb-1">
            <Settings size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configuración Global</span>
         </div>
         <h2 className="text-4xl font-black text-slate-900 font-heading uppercase tracking-tight leading-none">Ajustes del <span className="text-slate-600">Sistema</span></h2>
         <p className="text-slate-500 font-bold opacity-70">Control de datos, respaldos y parámetros generales de la aplicación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Backup Section */}
        <div className="glass bg-white p-10 border-slate-100 rounded-[3rem] shadow-sm space-y-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                 <Database className="text-blue-600" size={24} strokeWidth={2.5} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Respaldo de Datos</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Importar / Exportar JSON</p>
              </div>
           </div>

           <p className="text-slate-500 text-sm leading-relaxed font-medium">
             Utiliza estas opciones para generar una copia de seguridad de todos tus reportes y obras, o para restaurar información en un nuevo dispositivo.
           </p>

           <div className="flex flex-col gap-3">
              <button 
                onClick={onExportJSON}
                className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all active:scale-[0.98] group"
              >
                 <div className="flex items-center gap-3">
                    <Download size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Descargar Respaldo Completo</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">.JSON</span>
              </button>

              <button 
                onClick={onImportJSON}
                className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-white border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 text-slate-900 rounded-2xl transition-all active:scale-[0.98] group"
              >
                 <div className="flex items-center gap-3">
                    <Upload size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Cargar Respaldo Existente</span>
                 </div>
              </button>
           </div>
        </div>

        {/* Security Section */}
        <div className="glass bg-white p-10 border-slate-100 rounded-[3rem] shadow-sm space-y-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-2xl">
                 <ShieldCheck className="text-red-600" size={24} strokeWidth={2.5} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Limpieza & Seguridad</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Acciones Irreversibles</p>
              </div>
           </div>

           <p className="text-slate-500 text-sm leading-relaxed font-medium">
             Ten cuidado con estas acciones. Una vez eliminados los datos locales, no podrán recuperarse a menos que tengas un respaldo.
           </p>

           <button 
             onClick={() => {
                if(confirm("¿Estás seguro de eliminar TODOS los datos locales? Esta acción no se puede deshacer.")) {
                    localStorage.clear();
                    window.location.reload();
                }
             }}
             className="w-full flex items-center gap-3 px-6 py-5 bg-white border-2 border-red-50 hover:bg-red-50 text-red-600 rounded-2xl transition-all active:scale-[0.98] group"
           >
              <Trash2 size={20} />
              <span className="text-[11px] font-black uppercase tracking-widest">Limpiar Almacenamiento Local</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModule;
