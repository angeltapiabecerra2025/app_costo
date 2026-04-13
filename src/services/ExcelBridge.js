/** 
 * ExcelBridge.js
 * Logic to parse the complex COST CONTROL Excel templates.
 */
import * as XLSX from 'xlsx';

export const parseCostReport = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const result = {
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          sheets: {},
          metadata: {}
        };

        // Extract predefined sheets in order (Categorías first for dependencies)
        const targetSheets = [
          'Análisis por Categorías',
          'Matriz de Produccion', 
          'Matriz de Costos', 
          'Matriz de Resultados', 
          'Matriz de Proyecciones'
        ];
        let categoriesData = [];

        // First pass: Process AnalysisByCategory
        workbook.SheetNames.forEach(name => {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('categor')) {
            const sheet = workbook.Sheets[name];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            categoriesData = processAnalysisByCategory(json);
            result.sheets['Análisis por Categorías'] = categoriesData;
          }
        });

        // Second pass: Process Matrices
        workbook.SheetNames.forEach(name => {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('categor')) return; // Already handled

          if (lowerName.includes('produccion') || lowerName.includes('proyeccion')) {
            const sheet = workbook.Sheets[name];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            result.sheets['Matriz de Producción'] = processProductionMatrix(json, categoriesData);
          } else if (targetSheets.some(ts => lowerName.includes(ts.toLowerCase()))) {
            const sheet = workbook.Sheets[name];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            result.sheets[name] = processSheetData(json);
          }
        });

        // Try to get metadata from 'EIMI' or 'Indice' sheets
        if (workbook.Sheets['Indice']) {
          const indiceSheet = workbook.Sheets['Indice'];
          result.metadata.project = indiceSheet['B5']?.v || 'Proyecto Desconocido';
          result.metadata.client = indiceSheet['B4']?.v || 'EISA';
          result.metadata.manager = indiceSheet['B6']?.v || 'N/A';
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Process raw sheet rows into a hierarchical structure used by our custom grid.
 * We look for hierarchical patterns (Indentation, bold text simulation, or specific code patterns).
 */
const processSheetData = (rows) => {
  // Simple heuristic for this template:
  // Usually rows with just one cell filled are groups/headers.
  // Rows with data in multiple columns are line items.
  
  return rows.map((row, idx) => {
    const isHeader = row.length > 0 && row.every((c, i) => i === 0 || !c);
    const isEmpty = row.every(c => !c);
    
    if (isEmpty) return null;

    return {
      id: `row-${idx}`,
      type: isHeader ? 'group' : 'item',
      label: row[0] || '---',
      values: row.slice(1).map(v => typeof v === 'number' ? formatCurrency(v) : v)
    };
  }).filter(Boolean);
};

/**
 * Specific processor for "Análisis por Categorías"
 * Data starts from Row 6 (index 5)
 */
const processAnalysisByCategory = (rows) => {
  const dataRows = rows.slice(5); // Skip titles (rows 1-5)

  return dataRows
    .filter(row => row.some(cell => cell !== "")) // No filtramos por SI/SÍ, subimos todo lo que no sea vacío
    .map((row, idx) => {
      // Column Mapping (based on user description)
      const identification = {
        formato: row[0],
        subgrupo: String(row[1] || "").trim(),
        nombreSubgrupo: row[2],
        categoria: row[3],
        nombreCategoria: row[4],
        incluir: row[5]
      };

      const ingresos = {
        original: Number(row[6]) || 0,
        pom: Number(row[7]) || 0,
        adicionales: Number(row[8]) || 0,
        reajuste: Number(row[10]) || 0,
        finalProyectado: (Number(row[7]) || 0) + (Number(row[8]) || 0) + (Number(row[10]) || 0)
      };

      const prodActual = {
        original: Number(row[13]) || 0,
        adicionales: Number(row[14]) || 0,
        total: (Number(row[13]) || 0) + (Number(row[14]) || 0)
      };

      const prodAnterior = {
        original: Number(row[16]) || 0,
        adicionales: Number(row[17]) || 0,
        total: (Number(row[16]) || 0) + (Number(row[17]) || 0)
      };

      const costosActual = {
        acumulado: Number(row[19]) || 0,
        cambio: Number(row[20]) || 0,
        provisiones: Number(row[21]) || 0,
        realActual: (Number(row[19]) || 0) + (Number(row[20]) || 0) + (Number(row[21]) || 0)
      };

      const costosAnterior = {
        acumulado: Number(row[23]) || 0,
        cambio: Number(row[24]) || 0,
        provisiones: Number(row[25]) || 0,
        realAnterior: (Number(row[23]) || 0) + (Number(row[24]) || 0) + (Number(row[25]) || 0)
      };

      const proy = {
        proyIngreso: ingresos.finalProyectado - prodActual.total,
        inventario: Number(row[28]) || 0,
        pedidos: Number(row[29]) || 0,
        costoSaldo: Number(row[30]) || 0,
        proyTotalCosto: (Number(row[28]) || 0) + (Number(row[29]) || 0) + (Number(row[30]) || 0)
      };

      return {
        id: `analysis-${idx}`,
        identification,
        ingresos,
        prodActual,
        prodAnterior,
        costosActual,
        costosAnterior,
        proy
      };
    });
};

/**
 * Specific processor for "Matriz de Proyecciones" (Production Analysis)
 * Headers: Row 5 (index 4), Sub-headers: Row 7 (index 6)
 * Data starts from Row 9 (index 8)
 * Stop condition: Row[1] (Concept) includes "TOTALES"
 */
const processProductionMatrix = (rows, categoriesData = []) => {
  const dataRows = rows.slice(6); // Start at row 7 (index 6) to get COSTOS DIRECTOS
  const results = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    
    // Stop at TOTALES (usually row 188 or similar in EIMI template)
    if (!row[1] || String(row[1]).toUpperCase().includes('RESUMEN')) break;
    
    // Skip completely empty rows
    if (!row[0] && !row[1] && !row[2]) continue;

    // Detect group rows for styling (e.g., 0A00, 0B00, or row[0] is empty but row[1] has content)
    const isGroup = !row[0] || (row[0] && String(row[0]).endsWith('00')) || String(row[1]).toUpperCase() === row[1];

    // Logic: SUMAR.SI.CONJUNTO for all technical columns
    let budget = Number(row[2]) || 0;
    let pom = Number(row[3]) || 0;
    let currentAcum = {
      prod: Number(row[4]) || 0, // Col E
      adic: Number(row[5]) || 0, // Col F
      total: Number(row[6]) || 0 // Col G
    };
    let previousAcum = {
      prod: Number(row[7]) || 0, // Col H
      adic: Number(row[8]) || 0, // Col I
      total: Number(row[9]) || 0 // Col J
    };
    let period = {
      prod: Number(row[10]) || 0, // Col K
      adic: Number(row[11]) || 0, // Col L
      total: Number(row[12]) || 0 // Col M
    };
    
    // Sum from Categorías where SUB-G == Matriz.ColB
    if (!isGroup) {
      const codeToMatch = String(row[1] || "").trim(); // Columna B
      if (codeToMatch) {
        const matches = categoriesData.filter(cat => cat.identification.subgrupo === codeToMatch);
        
        // Sum values
        budget = matches.reduce((sum, cat) => sum + (cat.ingresos.original || 0), 0);
        pom = matches.reduce((sum, cat) => sum + (cat.ingresos.pom || 0), 0);
        
        currentAcum.prod = matches.reduce((sum, cat) => sum + (cat.prodActual.original || 0), 0);
        currentAcum.adic = matches.reduce((sum, cat) => sum + (cat.prodActual.adicionales || 0), 0);
        currentAcum.total = currentAcum.prod + currentAcum.adic;

        previousAcum.prod = matches.reduce((sum, cat) => sum + (cat.prodAnterior.original || 0), 0);
        previousAcum.adic = matches.reduce((sum, cat) => sum + (cat.prodAnterior.adicionales || 0), 0);
        previousAcum.total = previousAcum.prod + previousAcum.adic;

        // Dynamic Calculation for Periodo
        period.prod = currentAcum.prod - previousAcum.prod;
        period.adic = currentAcum.adic - previousAcum.adic;
        period.total = period.prod + period.adic;
      }
    }

    results.push({
      id: `prod-${i}`,
      code: row[0], // Col A
      concept: row[1], // Col B
      budget: budget,
      pom: pom,
      currentAcum: currentAcum,
      previousAcum: previousAcum,
      period: period,
      isGroup
    });
  }

  return results;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(val);
};

export default {
  parseCostReport
};
