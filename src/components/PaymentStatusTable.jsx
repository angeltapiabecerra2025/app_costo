import React, { useState, useRef } from 'react';
import { CheckCircle2, Upload, Save, Printer, Building2, ChevronDown, Table as TableIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatExcelDate = (val) => {
  if (!val || isNaN(Number(val)) || typeof val !== 'number') return val;
  const date = new Date((val - 25569) * 86400 * 1000);
  return date.toLocaleDateString('es-CL', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const formatNumber = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, ''));
  if (isNaN(num)) return val;
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const isNegative = (val) => {
  if (val === null || val === undefined || val === '') return false;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, ''));
  return !isNaN(num) && num < 0;
};

// Limpiador ultra-agresivo: solo letras y números
const clean = (s) => String(s || '').toUpperCase().normalize("NFD").replace(/[^A-Z0-9]/g, "");

const processOneSheet = (sheet, sheetTitle) => {
  if (!sheet) return null;
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!raw || raw.length === 0) return null;

  // Detectar la fila de encabezados
  let headerRowIdx = -1;
  let maxMatches = 0;
  const criticalKeywords = ['ESTADO', 'PAGO', 'FACTURACION', 'AVANCE', 'NETO', 'IVA'];
  
  for (let i = 0; i < Math.min(40, raw.length); i++) {
    const row = raw[i];
    if (!row) continue;
    let matches = 0;
    row.forEach(cell => {
      const c = clean(cell);
      if (criticalKeywords.some(k => c.includes(k))) matches++;
    });
    if (matches > maxMatches) {
      maxMatches = matches;
      headerRowIdx = i;
    }
  }

  if (headerRowIdx === -1) headerRowIdx = 0;

  const headerRow = raw[headerRowIdx];
  const headers = headerRow.map((h, i) => {
    if (h === '' || h === null || h === undefined) return `Col${i + 1}`;
    return String(h).trim();
  });

  const cleanHeaders = headerRow.map(h => clean(h));

  // Identificar índices con lógica de inclusión
  const nPagoIdx = cleanHeaders.findIndex(h => h.includes('ESTADO') && h.includes('PAGO'));
  const fechaIdx = cleanHeaders.findIndex(h => h.includes('FECHA') && (h.includes('FACT') || h.includes('DOC')));
  const facturaIdx = cleanHeaders.findIndex(h => (h.includes('FACT') || h.includes('DOC')) && !h.includes('ESTADO') && !h.includes('FECHA'));
  
  const numericMap = {
    avance: cleanHeaders.findIndex(h => h === 'AVANCE' || (h.includes('MONTO') && h.includes('NETO'))),
    anticipo: cleanHeaders.findIndex(h => h.includes('ANTICIPO')),
    retenciones: cleanHeaders.findIndex(h => h.includes('RETENCION')),
    reajuste: cleanHeaders.findIndex(h => h.includes('REAJUSTE')),
    pres_edp: cleanHeaders.findIndex(h => h.includes('PRESENTE') && h.includes('EDP')),
    tot_fact: cleanHeaders.findIndex(h => h.includes('TOT') && h.includes('FACTURADO') && h.includes('NETO')),
    iva: cleanHeaders.findIndex(h => h === 'IVA'),
    total: cleanHeaders.findIndex(h => h.includes('TOTAL') && h.includes('FACTURADO'))
  };
  
  const numericIndices = Object.values(numericMap).filter(idx => idx !== -1);
  const avanceIdx = numericMap.avance;

  const rows = [];
  for (let i = headerRowIdx + 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || row.every(c => !c || String(c).trim() === '' || String(c).trim() === '---')) continue;

    // Filtro Pago vacío/basura
    const nPagoValue = nPagoIdx !== -1 ? String(row[nPagoIdx] || '').trim() : '';
    if (nPagoIdx !== -1 && (!nPagoValue || nPagoValue === '---' || nPagoValue.includes('---'))) continue;

    // Filtro AVANCE: Si no tiene registros, sacar.
    if (avanceIdx !== -1) {
       const avVal = row[avanceIdx];
       if (!avVal || avVal === 0 || avVal === '0' || avVal === '---') continue;
    }

    const label = String(row[1] || row[0] || '').trim();
    
    const values = row.map((v, colIdx) => {
      const valStr = String(v || '').trim();
      if (valStr === '---' || valStr === '') return '';

      // FECHA FACTURACION o Columna M (index 12): Forzar a String con formato DD/MM/YYYY
      if ((colIdx === fechaIdx || colIdx === 12) && typeof v === 'number') {
        return formatExcelDate(v);
      }

      // N° FACTURA: Forzar a String
      if (colIdx === facturaIdx) {
        return valStr;
      }

      // Columnas Numéricas: Rounding
      if (numericIndices.includes(colIdx)) {
        if (!v || v === '') return 0;
        if (typeof v === 'number') return Math.round(v);
        const num = parseFloat(valStr.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? v : Math.round(num);
      }

      if (typeof v === 'number') return v;
      const num = parseFloat(valStr.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? v : num;
    });

    const valG = Number(values[numericMap.reajuste !== -1 ? numericMap.reajuste : 5]) || 0;
    const valH = Number(values[numericMap.pres_edp !== -1 ? numericMap.pres_edp : 6]) || 0;

    const isUpper = label === label.toUpperCase() && label.length > 3;
    
    rows.push({
      id: `${sheetTitle}-row-${i}`,
      type: isUpper ? 'titulo' : 'item',
      label,
      fullRow: values,
      valG,
      valH
    });
  }

  return { headers, rows, title: sheetTitle };
};

const parseEDPSheet = (workbook) => {
  const result = {
    facturado: null,
    proyectado: null
  };

  // Buscar Hoja Facturado
  const fName = workbook.SheetNames.find(n => n.toUpperCase().includes('FACTURADO') || n.toUpperCase().includes('EDP 1'));
  if (fName) result.facturado = processOneSheet(workbook.Sheets[fName], "EDP FACTURADO");
  else result.facturado = processOneSheet(workbook.Sheets[workbook.SheetNames[0]], "EDP FACTURADO");

  // Buscar Hoja Proyectado
  const pName = workbook.SheetNames.find(n => n.toUpperCase().includes('PROYECTADO') || n.toUpperCase().includes('EDP 2'));
  if (pName) result.proyectado = processOneSheet(workbook.Sheets[pName], "EDP PROYECTADOS");

  return result;
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const PaymentStatusTable = ({ initialData, projects = [], activeProjectId, onSaveReport, isHistoryView }) => {
  const [multiTableData, setMultiTableData] = useState(initialData || null);
  const [activeTab, setActiveTab] = useState('facturado'); // 'facturado' or 'proyectado'
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(activeProjectId || '');
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (initialData) setMultiTableData(initialData);
  }, [initialData]);

  const currentData = multiTableData ? (activeTab === 'facturado' ? multiTableData.facturado : multiTableData.proyectado) : null;

  const totals = React.useMemo(() => {
    if (!currentData) return { neto: 0, reajuste: 0 };
    return currentData.rows.reduce((acc, row) => {
      acc.neto += row.valH || 0;
      acc.reajuste += row.valG || 0;
      return acc;
    }, { neto: 0, reajuste: 0 });
  }, [currentData]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const parsed = parseEDPSheet(workbook);
        setMultiTableData(parsed);
      } catch (err) {
        alert('Error al leer el archivo Excel: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!multiTableData || !selectedProject) {
      alert('Selecciona una obra y carga un archivo antes de guardar.');
      return;
    }
    if (onSaveReport) {
      onSaveReport({
        reportType: 'Control de Estados de Pagos',
        period,
        projectId: selectedProject,
        data: multiTableData,
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ─────────────────────────────── */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-rose-500/10 p-2 rounded-xl">
              <CheckCircle2 size={24} className="text-rose-600" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">
              Gestión de Ingresos
            </span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none m-0">
            Estados <span className="text-rose-600">de Pago</span>
          </h2>
        </div>

        <div className="flex gap-3 items-center">
          {multiTableData && (
            <>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-500 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                <Printer size={16} /> Imprimir
              </button>
              {!isHistoryView && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                >
                  <Save size={16} /> Registrar EDP
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Control Bar ────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 mb-8 flex gap-6 items-end flex-wrap shadow-sm">
        <div className="flex flex-col gap-2 min-w-[240px]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Obra Vinculada
          </span>
          <div className="relative">
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-black text-[11px] uppercase outline-none appearance-none cursor-pointer focus:border-rose-500 transition-all"
            >
              <option value="" disabled>SELECCIONAR OBRA...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Periodo de Cobro
          </span>
          <input
            type="month"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-black text-[11px] uppercase outline-none focus:border-rose-500 transition-all"
          />
        </div>

        <div className="ml-auto flex gap-4">
           {multiTableData && (
             <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setActiveTab('facturado')}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'facturado' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  EDP Facturado
                </button>
                {multiTableData.proyectado && (
                  <button 
                    onClick={() => setActiveTab('proyectado')}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'proyectado' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    EDP Proyectados
                  </button>
                )}
             </div>
           )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          {!isHistoryView && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-xl shadow-slate-900/10"
            >
              <Upload size={18} strokeWidth={2.5} />
              {isUploading ? 'Procesando...' : 'Subir Plantilla EDP'}
            </button>
          )}
        </div>
      </div>

      {/* ── Table / Content ───────────────────── */}
      {currentData ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-50">
                <tr className="bg-[#e11d48] text-white">
                  {currentData.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-5 text-[10px] font-black uppercase tracking-widest text-center border-r border-white/10 ${i === 1 ? 'sticky left-0 z-50 bg-[#e11d48] border-r-2 border-white/20 min-w-[300px]' : ''}`}
                      style={i === 1 ? { left: 0 } : {}}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.rows.map((row) => {
                  const isTitulo = row.type === 'titulo';
                  const summaryBg = isTitulo ? 'bg-rose-500/10' : 'bg-white';
                  
                  return (
                    <tr key={row.id} className={`${summaryBg} hover:bg-rose-50/30 transition-colors`}>
                      {row.fullRow.map((val, colIdx) => {
                        const isPercentage = currentData.headers[colIdx]?.includes('%');
                        const isPrimary = colIdx === 1; // Columna de descripción
                        
                        return (
                          <td
                            key={colIdx}
                            className={`px-4 py-3 border-b border-slate-100 text-[11.5px] ${isPrimary ? 'sticky left-0 z-10 font-black uppercase' : 'text-right' } ${isStickyCol(colIdx) ? 'sticky left-0 bg-inherit border-r-2 border-slate-200' : 'border-r border-slate-50'}`}
                            style={isPrimary ? { left: 0, background: 'inherit' } : {}}
                          >
                            <span className={isTitulo ? 'text-rose-700' : (isPercentage ? 'text-blue-600 font-bold' : 'text-slate-600 font-bold')}>
                               {typeof val === 'number' 
                                 ? (isPercentage ? (val * (val < 1.1 ? 100 : 1)).toFixed(2) + '%' : formatNumber(val))
                                 : val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="bg-rose-600 p-8 px-14 flex justify-between items-center text-white">
             <div className="flex gap-16">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest mb-1">Registros Útiles</span>
                  <span className="text-3xl font-black">{currentData.rows.length}</span>
                </div>
                <div className="h-14 w-[1px] bg-white/20"></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest mb-1">Total Neto ({currentData.title})</span>
                  <span className="text-3xl font-black">{formatNumber(totals.neto)}</span>
                </div>
                <div className="h-14 w-[1px] bg-white/20"></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest mb-1">Reajuste Total</span>
                  <span className="text-3xl font-black">{formatNumber(totals.reajuste)}</span>
                </div>
             </div>
             <div className="text-right">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] block mb-1">EIMI-COSTO</span>
                <span className="text-[14px] font-black uppercase tracking-tighter opacity-80">{currentData.title} | {period}</span>
             </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-rose-200 p-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-10 border border-rose-100">
                <TableIcon size={40} className="text-rose-600" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
               Carga de <span className="text-rose-600">Plantilla EDP Dual</span>
            </h3>
            <p className="text-slate-400 font-bold max-w-sm leading-relaxed mb-10">
               Sube el archivo Excel que contiene las hojas de "Facturado" y "Proyectado". El sistema filtrará automáticamente las filas sin avance.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-rose-600 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Upload size={18} strokeWidth={3} />
              Seleccionar Archivo
            </button>
        </div>
      )}
    </div>
  );
};

const isStickyCol = (idx) => idx === 1;

export default PaymentStatusTable;
