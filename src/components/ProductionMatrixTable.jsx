import React from 'react';
import { cn } from '../utils/cn';

const ProductionMatrixTable = ({ data = [] }) => {
  const formatCLP = (val) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="mt-8 animate-fade-in group">
      <div className="overflow-auto border border-[#94a3b8] rounded-sm shadow-xl max-h-[80vh] bg-[#f8fafc]">
        <table className="w-full border-collapse text-[10px] bg-white">
          <thead className="sticky top-0 z-50">
            {/* Header Level 1 */}
            <tr className="bg-[#e2e8f0] border-b border-[#94a3b8]">
              <th colSpan="2" className="py-2 px-3 border-r border-[#94a3b8] text-center font-bold uppercase text-slate-700">PARTIDA / CATEGORIA</th>
              <th className="py-2 px-3 border-r border-[#94a3b8] text-center font-bold uppercase text-slate-700">PRESUPUESTO</th>
              <th className="py-2 px-3 border-r border-[#94a3b8] text-center font-bold uppercase text-slate-700">POM</th>
              <th colSpan="3" className="py-2 px-3 border-r border-[#94a3b8] bg-[#94a3b8] text-center font-bold uppercase text-white">ACUMULADO</th>
              <th colSpan="3" className="py-2 px-3 border-r border-[#94a3b8] bg-[#cbd5e1] text-center font-bold uppercase text-slate-800">ANTERIOR</th>
              <th colSpan="3" className="py-2 px-3 text-center font-bold uppercase text-slate-800">PERIODO</th>
            </tr>
            {/* Header Level 2 */}
            <tr className="bg-[#f1f5f9] border-b border-[#94a3b8] text-[9px]">
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-500">Cód</th>
              <th className="py-1 px-4 border-r border-[#94a3b8] text-left font-bold text-slate-500">Descripción</th>
              <th className="py-1 px-3 border-r border-[#94a3b8]"></th>
              <th className="py-1 px-3 border-r border-[#94a3b8]"></th>
              
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-600">PRODUCCION</th>
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-600">ADICIONALES</th>
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-800 bg-[#94a3b8]/10 uppercase text-[8px]">TOTAL PROD. ACUMULADA</th>
              
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-600">PRODUCCION</th>
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-600">ADICIONALES</th>
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-800 bg-slate-100 uppercase text-[8px]">TOTAL PROD. ANTERIOR</th>
              
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-600">PRODUCCION</th>
              <th className="py-1 px-2 border-r border-[#94a3b8] text-center font-bold text-slate-600">ADICIONALES</th>
              <th className="py-1 px-2 text-center font-bold text-slate-800 bg-slate-50 uppercase text-[8px]">TOTAL PROD. PERIODO</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className={cn(
                "border-b border-[#cbd5e1] hover:bg-blue-50/30 transition-colors",
                row.isGroup ? "bg-[#f1f5f9] font-black" : "bg-white"
              )}>
                <td className="py-1.5 px-2 border-r border-[#cbd5e1] text-center text-slate-400 font-mono text-[9px]">{row.code || ''}</td>
                <td className={cn(
                  "py-1.5 px-4 border-r border-[#cbd5e1] truncate max-w-[300px]",
                  row.isGroup ? "text-slate-900 uppercase" : "text-slate-700 pl-8 font-medium"
                )}>
                  {row.concept}
                </td>
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right text-slate-900">{formatCLP(row.budget)}</td>
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right text-slate-900">{formatCLP(row.pom)}</td>

                {/* Acumulado */}
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right text-slate-900">{formatCLP(row.currentAcum.prod)}</td>
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right text-slate-900">{formatCLP(row.currentAcum.adic)}</td>
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right font-black bg-slate-50/50">{formatCLP(row.currentAcum.total)}</td>

                {/* Anterior */}
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right text-slate-600">{formatCLP(row.previousAcum.prod)}</td>
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right text-slate-600">{formatCLP(row.previousAcum.adic)}</td>
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right font-black bg-slate-50/50 text-slate-700">{formatCLP(row.previousAcum.total)}</td>

                {/* Periodo */}
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right font-black text-blue-600">{formatCLP(row.period.prod)}</td>
                <td className="py-1.5 px-3 border-r border-[#cbd5e1] text-right font-black text-blue-600">{formatCLP(row.period.adic)}</td>
                <td className="py-1.5 px-3 text-right font-black bg-blue-50 text-blue-900">{formatCLP(row.period.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase text-slate-400 bg-white p-4 rounded-xl border border-slate-100 italic">
        <span>* Vista Previa Técnica basada en Mapeo de Columnas A-M</span>
        <span className="text-blue-500">Dossier: Matriz de Producción Estilo</span>
      </div>
    </div>
  );
};

export default ProductionMatrixTable;
