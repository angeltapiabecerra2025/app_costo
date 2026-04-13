import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'template/Estructura_Matrices.xlsx';
if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const buf = fs.readFileSync(filePath);
const wb = XLSX.read(buf, { type: 'buffer' });

const result = {};
wb.SheetNames.forEach(name => {
    const sheet = wb.Sheets[name];
    result[name] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
});

console.log(JSON.stringify(result, null, 2));
