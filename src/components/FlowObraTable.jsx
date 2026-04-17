import React, { useState, useRef } from 'react';
import { TrendingUp, Upload, Save, Printer, Building2, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
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

const parseFlujoSheet = (workbook) => {
  // Buscar la hoja que contenga "flujo" en el nombre (case-insensitive)
  const sheetName = workbook.SheetNames.find(n =>
    n.toLowerCase().includes('flujo')
  ) || workbook.SheetNames[0];

  if (!sheetName) return { headers: [], rows: [] };

  const sheet = workbook.Sheets[sheetName];
  // raw: true para no convertir fechas a strings raros
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!raw || raw.length === 0) return { headers: [], rows: [] };

  // Detectar la fila de encabezados: Buscamos la fila que contiene el texto "MENSUAL"
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(20, raw.length); i++) {
    const row = raw[i];
    if (row && row.some(c => String(c).toUpperCase().includes('MENSUAL'))) {
      headerRowIdx = i;
      break;
    }
  }

  // Construir cabeceras (saltar columna A que es el tipo de fila)
  // La columna A contiene "titulo1", "subtitulo1", etc.
  // La columna B podría ser la descripción real
  const headerRow = raw[headerRowIdx];
  // Los headers son desde columna B en adelante (índice 1+)
  // Pero si la primera celda (col A) tiene un texto que no parece un mes/periodo,
  // lo dejamos como encabezado de descripción
  const headers = headerRow.slice(1).map((h, i) => {
    if (h === '' || h === null || h === undefined) return `Col${i + 2}`;
    // Si es número de serie de fecha Excel, convertirlo
    if (typeof h === 'number' && h > 40000) {
      const d = XLSX.SSF.parse_date_code(h);
      if (d) return `${String(d.m).padStart(2, '0')}/${d.y}`;
    }
    return String(h).trim();
  });

  // Determinar qué tipo de fila es cada una según columna A
  const rows = [];
  for (let i = headerRowIdx + 1; i < raw.length; i++) {
    const row = raw[i];
    // Saltar filas completamente vacías
    if (row.every(c => c === '' || c === null || c === undefined)) continue;

    const colAValue = String(row[0] || '').toLowerCase().trim();

    // Determinar tipo: titulo, subtitulo, o vacío (ignorar)
    let rowType = 'subtitulo';
    if (colAValue.startsWith('titulo') || colAValue.startsWith('título')) {
      rowType = 'titulo';
    } else if (colAValue.startsWith('subtitulo') || colAValue.startsWith('subtítulo')) {
      rowType = 'subtitulo';
    } else if (colAValue === '') {
      // Si col A está vacía pero hay datos en B, tratarlo como subtitulo
      rowType = 'subtitulo';
    } else {
      // Cualquier otro valor en col A: tratarlo como subtitulo
      rowType = 'subtitulo';
    }

    // La descripción es la columna B (índice 1)
    const label = String(row[1] || '').trim();
    // Los valores son desde columna C (índice 2) en adelante
    // Pero en la imagen veo que empieza desde col B con descripción y luego valores
    // Vamos a tomar col B como descripción y el resto como valores
    const values = row.slice(2).map(v => {
      if (v === '' || v === null || v === undefined) return '';
      if (typeof v === 'number') return v;
      const num = parseFloat(String(v).replace(/[^\d.-]/g, ''));
      return isNaN(num) ? v : num;
    });

    // Ajustar cantidad de valores para que coincida con headers (que empiezan desde col C)
    // headers tiene: col B, C, D... (desde slice(1) de headerRow)
    // values tiene: col C, D... (desde slice(2) de row)
    // Entonces el primer header corresponde a colB (descripción)
    // y los valores de datos van desde el segundo header en adelante

    rows.push({
      id: `row-${i}`,
      type: rowType,
      label,
      values, // alineados con headers[1..] (desde col C del Excel)
    });
  }

  // Headers reales para datos son desde índice 1 (col C en adelante del Excel)
  const dataHeaders = headers.slice(1); // quitar el primer header que correspondía a col B (descripción)

  return { headers: dataHeaders, rows };
};

// ─────────────────────────────────────────────
// Subcomponent: Celda de valor
// ─────────────────────────────────────────────
const ValueCell = ({ value, isTitulo, isSummary, bgColor }) => {
  const neg = isNegative(value);
  const display = formatNumber(value);

  // User requirement: positive black, negative red
  // Exception: Summary rows use black text on themed backgrounds (but RED if negative)
  const color = isSummary ? (neg ? '#dc2626' : '#000000') : (neg ? '#dc2626' : '#000000');

  return (
    <td
      style={{
        textAlign: 'center',
        fontFamily: "'Inter', monospace",
        fontSize: '13px',
        fontWeight: (isTitulo || isSummary) ? '800' : (neg ? '700' : '500'),
        color,
        padding: '5px 10px',
        whiteSpace: 'nowrap',
        borderRight: isSummary ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(0,0,0,0.08)',
        minWidth: '90px',
        background: isSummary ? bgColor : 'white',
      }}
    >
      {display}
    </td>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const FlowObraTable = ({ initialData, projects = [], activeProjectId, onSaveReport, isHistoryView }) => {
  const [tableData, setTableData] = useState(initialData || null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(activeProjectId || '');
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (initialData) setTableData(initialData);
  }, [initialData]);

  // ── Upload Handler ──────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const parsed = parseFlujoSheet(workbook);
        setTableData(parsed);
      } catch (err) {
        alert('Error al leer el archivo Excel: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Error al leer el archivo.');
      setIsUploading(false);
    };
    reader.readAsArrayBuffer(file);
    // Reset el input para poder volver a subir el mismo archivo
    e.target.value = '';
  };

  // ── Save Handler ────────────────────────────
  const handleSave = () => {
    if (!tableData || !selectedProject) {
      alert('Selecciona una obra y carga un archivo antes de guardar.');
      return;
    }
    if (onSaveReport) {
      onSaveReport({
        reportType: 'Flujo de Obra',
        period,
        projectId: selectedProject,
        data: tableData,
      });
    }
  };

  // ── Print ────────────────────────────────────
  const handlePrint = () => window.print();

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="animate-fade-in">
      {/* ── Header ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <TrendingUp size={22} color="#e11d48" strokeWidth={2.5} />
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Módulo de Gestión
            </span>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>
            Flujo <span style={{ color: '#e11d48' }}>de Obra</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {tableData && (
            <>
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'white', border: '1.5px solid #e2e8f0',
                  color: '#475569', borderRadius: '14px',
                  padding: '10px 18px', fontWeight: '800',
                  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                <Printer size={15} /> Imprimir
              </button>
              {!isHistoryView && (
                <button
                  onClick={handleSave}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#0f172a', border: 'none',
                    color: 'white', borderRadius: '14px',
                    padding: '10px 22px', fontWeight: '800',
                    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >
                  <Save size={15} /> Registrar en Historial
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Control Bar ────────────────────────── */}
      <div style={{
        background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
        padding: '20px 24px', marginBottom: '20px',
        display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {/* Selector de Obra */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
          <span style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Obra
          </span>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              style={{
                width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: '12px', padding: '10px 36px 10px 14px',
                fontWeight: '700', fontSize: '11px', outline: 'none',
                appearance: 'none', cursor: 'pointer', color: '#1e293b',
              }}
            >
              <option value="" disabled>SELECCIONAR OBRA...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Periodo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Periodo
          </span>
          <input
            type="month"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{
              background: '#f8fafc', border: '1.5px solid #e2e8f0',
              borderRadius: '12px', padding: '10px 14px',
              fontWeight: '700', fontSize: '11px', outline: 'none', color: '#1e293b',
            }}
          />
        </div>

        {/* Upload Button */}
        <div style={{ marginLeft: 'auto' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: isUploading ? '#94a3b8' : '#e11d48',
              border: 'none', color: 'white', borderRadius: '14px',
              padding: '12px 28px', fontWeight: '800',
              fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(225,29,72,0.25)',
              transition: 'all 0.2s',
            }}
          >
            <Upload size={16} strokeWidth={2.5} />
            {isUploading ? 'Procesando...' : 'Cargar Excel Flujo Obra'}
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────── */}
      {tableData ? (
        <div style={{
          background: 'white', borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '72vh' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              tableLayout: 'auto',
            }}>
              {/* ── Thead ─────────────────────── */}
              <thead>
                <tr>
                  <th style={{
                    position: 'sticky', top: 0, left: 0, zIndex: 30,
                    background: '#e11d48',
                    color: '#ffffff',
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    borderRight: '2px solid rgba(255,255,255,0.2)',
                    minWidth: '240px',
                    whiteSpace: 'nowrap',
                  }}>
                    DESCRIPCIÓN / PERÍODO
                  </th>
                  {tableData.headers.map((h, i) => (
                    <th key={i} style={{
                      position: 'sticky', top: 0, zIndex: 10,
                      background: '#e11d48',
                      color: '#ffffff',
                      padding: '16px 12px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                      minWidth: '100px',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {(() => {
                  let ivaSeen = 0;
                  return tableData.rows.map((row, rowIdx) => {
                  const isTitulo = row.type === 'titulo';
                  
                  // Identificar IVA
                  const isIVA = String(row.label || '').toUpperCase().includes('IVA (19%)');
                  if (isIVA) ivaSeen++;

                  // Grupo Verde (#C6E0B4)
                  const greenLabels = ['INGRESOS', 'TOTAL INGRESO NETO', 'TOTAL INGRESOS'];
                  const isGreenBase = greenLabels.some(l => String(row.label || '').toUpperCase().includes(l));
                  
                  // Grupo Amarillo (#FFF2CC)
                  const yellowLabels = ['TOTAL COSTOS NETOS', 'TOTAL COSTOS', 'COSTOS'];
                  const isYellowBase = !isGreenBase && yellowLabels.some(l => String(row.label || '').toUpperCase().includes(l));

                  // Grupo Plomo (#CBD5E1)
                  const plomoLabels = ['MENSUAL'];
                  const isPlomoBase = !isGreenBase && !isYellowBase && plomoLabels.some(l => String(row.label || '').toUpperCase().includes(l));
                  
                  // Lógica final para IVA repartido
                  const isGreen = isGreenBase || (isIVA && ivaSeen === 1);
                  const isYellow = !isGreen && (isYellowBase || (isIVA && ivaSeen === 2));
                  const isPlomo = !isGreen && !isYellow && isPlomoBase;

                  const isSummary = isGreen || isYellow || isPlomo;
                  
                  let summaryBg = '#ffffff';
                  if (isGreen) summaryBg = '#C6E0B4';
                  else if (isYellow) summaryBg = '#FFF2CC';
                  else if (isPlomo) summaryBg = '#CBD5E1';

                  // Estilos de la fila: Siempre fondo blanco salvo filas de resumen
                  const rowStyle = {
                    background: summaryBg,
                    borderBottom: '1px solid #e2e8f0',
                    borderTop: (isTitulo && rowIdx > 0) ? '1px solid #cbd5e1' : 'none',
                  };

                  return (
                    <tr key={row.id} style={rowStyle}>
                      {/* Celda de descripción */}
                      <td style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        background: summaryBg,
                        padding: isTitulo ? '10px 16px 10px 20px' : '8px 16px 8px 28px',
                        fontWeight: (isTitulo || isSummary) ? '900' : '600',
                        fontSize: '11px',
                        color: (isTitulo || isSummary) ? (isNegative(row.label) ? '#dc2626' : '#000000') : '#334155',
                        textTransform: (isTitulo || isSummary) ? 'uppercase' : 'none',
                        letterSpacing: (isTitulo || isSummary) ? '0.04em' : '0',
                        borderRight: isSummary ? '2px solid rgba(0,0,0,0.1)' : '2px solid #e2e8f0',
                        whiteSpace: 'nowrap',
                        maxWidth: '320px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {isTitulo && (
                          <span style={{
                            display: 'inline-block',
                            width: '4px', height: '14px',
                            background: '#e11d48',
                            borderRadius: '2px',
                            marginRight: '10px',
                            verticalAlign: 'middle',
                          }} />
                        )}
                        {row.label}
                      </td>

                      {/* Celdas de valores */}
                      {tableData.headers.map((_, colIdx) => (
                        <ValueCell
                          key={colIdx}
                          value={row.values[colIdx] !== undefined ? row.values[colIdx] : ''}
                          isTitulo={isTitulo}
                          isSummary={isSummary}
                          bgColor={summaryBg}
                        />
                      ))}
                    </tr>
                  );
                })}
              })()}
              </tbody>
            </table>
          </div>

          {/* Footer info */}
          <div style={{
            padding: '12px 20px',
            background: '#e11d48',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
              {tableData.rows.length} FILAS · {tableData.headers.length} PERÍODOS
            </span>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
              EIMI-COSTO · CONSOLIDACIÓN DE FLUJO DE OBRA
            </span>
          </div>
        </div>
      ) : (
        /* ── Empty State ─────────────────────── */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 40px',
          background: 'white', borderRadius: '24px',
          border: '2px dashed #fecdd3',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'rgba(225,29,72,0.06)',
            borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '28px',
            border: '1px solid #fecdd3',
          }}>
            <TrendingUp size={40} color="#e11d48" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: '10px', fontWeight: '900', color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '12px' }}>
            Flujo de Obra
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '16px' }}>
            Carga el Excel<br />
            <span style={{ color: '#e11d48' }}>para visualizar</span>
          </h3>
          <p style={{ color: '#94a3b8', fontWeight: '600', maxWidth: '320px', lineHeight: 1.6, fontSize: '13px' }}>
            Sube el archivo Excel con el flujo de obra. La tabla detectará automáticamente los títulos y subtítulos.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: '32px',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#e11d48', border: 'none', color: 'white',
              borderRadius: '16px', padding: '14px 32px',
              fontWeight: '800', fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              cursor: 'pointer', boxShadow: '0 6px 20px rgba(225,29,72,0.3)',
            }}
          >
            <Upload size={18} strokeWidth={2.5} />
            Seleccionar archivo Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default FlowObraTable;
