import React, { useMemo, useState } from 'react';
import { cn } from '../utils/cn';

const formatCLP = (val) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(val);
};

const AnalysisByCategoryTable = ({ data = [], onSave, isHistoryView = false }) => {
  const [activeTab, setActiveTab] = useState('actual'); // 'actual' | 'hist'

  if (!data || data.length === 0) {
    return (
      <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold font-heading uppercase tracking-widest text-xs">Carga un archivo Excel para ver el detalle técnico.</p>
      </div>
    );
  }

  // Totals Calculation
  const totals = useMemo(() => {
    const sums = {
      ingOrg: 0, ingPom: 0, ingAdic: 0, ingReaj: 0, ingFin: 0,
      prodAcum: 0, prodAdic: 0, prodTot: 0,
      prodAntAcum: 0, prodAntAdic: 0, prodAntTot: 0,
      costoAcum: 0, costoCamb: 0, costoProv: 0, costoReal: 0,
      costoAntAcum: 0, costoAntCamb: 0, costoAntProv: 0, costoAntReal: 0,
      proyIng: 0, proyInv: 0, proyPed: 0, proySal: 0, proyTot: 0
    };
    data.forEach(r => {
      sums.ingOrg += r.ingresos?.original || 0;
      sums.ingPom += r.ingresos?.pom || 0;
      sums.ingAdic += r.ingresos?.adicionales || 0;
      sums.ingReaj += r.ingresos?.reajuste || 0;
      sums.ingFin += r.ingresos?.finalProyectado || 0;
      sums.prodAcum += r.prodActual?.original || 0;
      sums.prodAdic += r.prodActual?.adicionales || 0;
      sums.prodTot += r.prodActual?.total || 0;
      sums.prodAntAcum += r.prodAnterior?.original || 0;
      sums.prodAntAdic += r.prodAnterior?.adicionales || 0;
      sums.prodAntTot += r.prodAnterior?.total || 0;
      sums.costoAcum += r.costosActual?.acumulado || 0;
      sums.costoCamb += r.costosActual?.cambio || 0;
      sums.costoProv += r.costosActual?.provisiones || 0;
      sums.costoReal += r.costosActual?.realActual || 0;
      sums.costoAntAcum += r.costosAnterior?.acumulado || 0;
      sums.costoAntCamb += r.costosAnterior?.cambio || 0;
      sums.costoAntProv += r.costosAnterior?.provisiones || 0;
      sums.costoAntReal += r.costosAnterior?.realAnterior || 0;
      sums.proyIng += r.proy?.proyIngreso || 0;
      sums.proyInv += r.proy?.inventario || 0;
      sums.proyPed += r.proy?.pedidos || 0;
      sums.proySal += r.proy?.costoSaldo || 0;
      sums.proyTot += r.proy?.proyTotalCosto || 0;
    });
    return sums;
  }, [data]);

  const isActual = activeTab === 'actual';

  const blocks = isActual ? [
    { title: 'Identificación', cols: 6, color: 'text-slate-500', bg: 'bg-slate-100' },
    { title: 'Ingresos', cols: 5, color: 'text-blue-700', bg: 'bg-blue-50' },
    { title: 'Producción Actual', cols: 3, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { title: 'Costos Actuales', cols: 4, color: 'text-amber-700', bg: 'bg-amber-50' },
    { title: 'Proyecciones', cols: 5, color: 'text-purple-700', bg: 'bg-purple-50' },
  ] : [
    { title: 'Identificación', cols: 6, color: 'text-slate-500', bg: 'bg-slate-100' },
    { title: 'Ingresos', cols: 5, color: 'text-blue-700', bg: 'bg-blue-50' },
    { title: 'Producción Anterior', cols: 3, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { title: 'Costos Anteriores', cols: 4, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  const subHeaders = isActual ? [
    { l: 'F. Gral', isN: false }, { l: 'Sub-G', isN: false }, { l: 'N. Sub Grupo', isN: false }, { l: 'Cat.', isN: false }, { l: 'N. Categoría', isN: false }, { l: 'Inc.', isN: false },
    { l: 'Orig.', isN: true, val: totals.ingOrg }, { l: 'POM', isN: true, val: totals.ingPom }, { l: 'Adic.', isN: true, val: totals.ingAdic }, { l: 'Rjste', isN: true, val: totals.ingReaj }, { l: 'P. FINAL', isN: true, val: totals.ingFin },
    { l: 'Acum.', isN: true, val: totals.prodAcum }, { l: 'Adic.', isN: true, val: totals.prodAdic }, { l: 'TOTAL PROD', isN: true, val: totals.prodTot },
    { l: 'Acum.', isN: true, val: totals.costoAcum }, { l: 'Cambio', isN: true, val: totals.costoCamb }, { l: 'Prov.', isN: true, val: totals.costoProv }, { l: 'COSTO REAL', isN: true, val: totals.costoReal },
    { l: 'Proy. Ing.', isN: true, val: totals.proyIng }, { l: 'Inv.', isN: true, val: totals.proyInv }, { l: 'Pedidos', isN: true, val: totals.proyPed }, { l: 'Saldo', isN: true, val: totals.proySal }, { l: 'PROY. TOTAL', isN: true, val: totals.proyTot }
  ] : [
    { l: 'F. Gral', isN: false }, { l: 'Sub-G', isN: false }, { l: 'N. Sub Grupo', isN: false }, { l: 'Cat.', isN: false }, { l: 'N. Categoría', isN: false }, { l: 'Inc.', isN: false },
    { l: 'Orig.', isN: true, val: totals.ingOrg }, { l: 'POM', isN: true, val: totals.ingPom }, { l: 'Adic.', isN: true, val: totals.ingAdic }, { l: 'Rjste', isN: true, val: totals.ingReaj }, { l: 'P. FINAL', isN: true, val: totals.ingFin },
    { l: 'Ant. Acum.', isN: true, val: totals.prodAntAcum }, { l: 'Ant. Adic.', isN: true, val: totals.prodAntAdic }, { l: 'TOTAL ANT', isN: true, val: totals.prodAntTot },
    { l: 'Cost. Ant.', isN: true, val: totals.costoAntAcum }, { l: 'Camb. Ant.', isN: true, val: totals.costoAntCambio }, { l: 'Prov. Ant.', isN: true, val: totals.costoAntProv }, { l: 'REAL ANT', isN: true, val: totals.costoAntReal }
  ];

  const leftOffsets = [0, 80, 160, 400, 480, 800];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300">
         <div className="flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 uppercase font-heading tracking-tight tracking-tighter">Análisis Técnico <span className="text-blue-600 font-black">PRO</span></h3>
            {isHistoryView && (
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Viendo Registro del Historial</p>
            )}
         </div>
         
         <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            <button 
                onClick={() => setActiveTab('actual')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                    isActual ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
            >
                Periodo Actual
            </button>
            <button 
                onClick={() => setActiveTab('hist')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                    !isActual ? "bg-white text-blue-600 shadow-md font-bold" : "text-slate-400 hover:text-slate-600"
                )}
            >
                Periodo Anterior
            </button>
         </div>

         {!isHistoryView && onSave && (
           <button 
             onClick={onSave}
             className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
           >
             Guardar en Historial
           </button>
         )}
      </div>

      <div className="analysis-v2-container shadow-2xl rounded-[2.5rem] border border-slate-200 overflow-auto bg-white" style={{ maxHeight: '72vh' }}>
        <table className="analysis-v2-table border-separate border-spacing-0 min-w-max">
          <thead>
            {/* R1: BLOQUES */}
            <tr className="sticky top-0 z-50">
              {blocks.map((block, i) => (
                <th key={i} colSpan={block.cols} className={cn("h-10 text-[10px] font-black uppercase tracking-widest border-b-2 border-r border-slate-200 sticky top-0", block.bg, block.color, i < 1 ? "sticky-col z-60" : "z-50")} style={i < 1 ? { left: 0 } : {}}>{block.title}</th>
              ))}
            </tr>
            {/* R2: TOTALES */}
            <tr className="sticky top-10 z-40 bg-[#0f172a]">
              {subHeaders.map((sh, i) => (
                <th key={i} className={cn("h-12 text-xs font-black text-white text-right px-4 border-b border-r border-white/5 sticky top-10", i < 6 ? "sticky-col z-50 bg-[#0f172a]" : "z-40")} style={i < 6 ? { left: `${leftOffsets[i]}px` } : {}}>{sh.isN ? formatCLP(sh.val) : ''}</th>
              ))}
            </tr>
            {/* R3: NOMBRES */}
            <tr className="sticky top-[85px] z-30 bg-slate-50">
              {subHeaders.map((sh, i) => (
                <th key={i} className={cn("h-10 text-[9px] font-bold text-slate-500 uppercase tracking-tight text-left px-4 border-b-2 border-r border-slate-200 sticky top-[88px]", i < 6 ? "sticky-col z-40 bg-slate-50" : "z-30")} style={i < 6 ? { left: `${leftOffsets[i]}px` } : {}}>{sh.l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="sticky-col font-bold border-b border-r border-slate-100" style={{ left: '0px', width: '80px' }}>{row.identification.formato}</td>
                <td className="sticky-col font-bold border-b border-r border-slate-100" style={{ left: '80px', width: '80px' }}>{row.identification.subgrupo}</td>
                <td className="sticky-col font-bold border-b border-r border-slate-100 truncate" style={{ left: '160px', width: '240px', fontSize: '10px' }}>{row.identification.nombreSubgrupo}</td>
                <td className="sticky-col font-bold border-b border-r border-slate-100" style={{ left: '400px', width: '80px' }}>{row.identification.categoria}</td>
                <td className="sticky-col font-bold text-blue-600 border-b border-r border-slate-100 whitespace-normal break-words" style={{ left: '480px', width: '320px', minWidth: '320px', fontSize: '10px', lineHeight: '1.2' }}>{row.identification.nombreCategoria}</td>
                <td className="sticky-col text-center font-black border-b border-r border-slate-100" style={{ left: '800px', width: '60px' }}>{row.identification.incluir}</td>

                <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.ingresos.original)}</td>
                <td className="text-right text-slate-500 border-b border-r border-slate-50 font-bold">{formatCLP(row.ingresos.pom)}</td>
                <td className="text-right text-slate-500 border-b border-r border-slate-50 font-bold">{formatCLP(row.ingresos.adicionales)}</td>
                <td className="text-right text-slate-500 border-b border-r border-slate-50 font-bold">{formatCLP(row.ingresos.reajuste)}</td>
                <td className="text-right font-black text-blue-700 bg-blue-50/30 border-b border-r border-blue-100">{formatCLP(row.ingresos.finalProyectado)}</td>

                {isActual ? (
                    <>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.prodActual.original)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.prodActual.adicionales)}</td>
                        <td className="text-right font-black text-emerald-700 bg-emerald-50/30 border-b border-r border-emerald-100">{formatCLP(row.prodActual.total)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.costosActual.acumulado)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.costosActual.cambio)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.costosActual.provisiones)}</td>
                        <td className="text-right font-black text-amber-700 bg-amber-50/30 border-b border-r border-amber-100">{formatCLP(row.costosActual.realActual)}</td>
                        <td className="text-right font-black text-blue-600 border-b border-r border-slate-50">{formatCLP(row.proy.proyIngreso)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.proy.inventario)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.proy.pedidos)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.proy.costoSaldo)}</td>
                        <td className="text-right bg-red-600 text-white font-black border-b border-r border-red-700">{formatCLP(row.proy.proyTotalCosto)}</td>
                    </>
                ) : (
                    <>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.prodAnterior.original)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.prodAnterior.adicionales)}</td>
                        <td className="text-right font-black text-emerald-700 bg-emerald-50/30 border-b border-r border-emerald-100">{formatCLP(row.prodAnterior.total)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.costosAnterior.acumulado)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.costosAnterior.cambio)}</td>
                        <td className="text-right text-slate-500 border-b border-r border-slate-50">{formatCLP(row.costosAnterior.provisiones)}</td>
                        <td className="text-right font-black text-amber-700 bg-amber-50/30 border-b border-r border-amber-100">{formatCLP(row.costosAnterior.realAnterior)}</td>
                    </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalysisByCategoryTable;
