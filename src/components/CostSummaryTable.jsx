import React from 'react';

const CostSummaryTable = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-8 animate-fade-in max-w-4xl mx-auto pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-6 px-10 text-left font-black uppercase tracking-widest text-[11px]">Costos Directos (Concepto)</th>
              <th className="py-6 px-10 text-center font-black uppercase tracking-widest text-[11px] w-[150px]">Código</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className={`${row.isGroup ? 'bg-slate-50/80 font-black' : 'hover:bg-blue-50/20'} transition-all group`}>
                <td className={`py-5 px-10 text-slate-700 text-sm ${row.isGroup ? 'text-blue-900 border-l-4 border-blue-600' : 'pl-16'}`}>
                  {row.concept}
                </td>
                <td className="py-5 px-10 text-center font-mono text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors">
                  {row.code || '---'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 0 && (
          <div className="bg-slate-50 p-6 text-center border-t border-slate-100 italic text-[10px] font-black uppercase text-slate-400 tracking-widest">
            * Información extraída de Matriz de Producción (B7:B {"->"} A9:A)
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSummaryTable;
