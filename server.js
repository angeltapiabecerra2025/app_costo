import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'VISTA_PREVIA_COSTOS.html');
const DATA_FILE = path.join(__dirname, 'db.json');

// Ensure db.json exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ reports: [], projects: [] }, null, 2));
}

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Health Check
    if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', server: 'COST PRO' }));
    }

    // Serve VISTA_PREVIA_COSTOS.html at root
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(FILE_PATH, (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error al cargar el archivo de vista previa.');
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    // API: Get Data
    if (req.url === '/api/data' && req.method === 'GET') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: 'Error reading database' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    // API: Save Data
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const newData = JSON.parse(body);
                fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500);
                        return res.end(JSON.stringify({ error: 'Error writing database' }));
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                });
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`ERROR: El puerto ${PORT} ya est en uso. Por favor cierra otras instancias del servidor.`);
    } else {
        console.error('Error del servidor:', e);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('=========================================');
    console.log(`COST PRO Server activo`);
    console.log(`Acceso Local: http://localhost:${PORT}`);
    console.log(`Acceso Red:   http://127.0.0.1:${PORT}`);
    console.log('=========================================');
    console.log('Presiona Ctrl+C para detener el servidor');
});


