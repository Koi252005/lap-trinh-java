const https = require('http');

// Configuration
const HOST = 'localhost';
const PORT = 5001;
const AUTH_PATH = '/api/auth/sync-user';
const CREATE_FARM_PATH = '/api/farms';
const MOCK_TOKEN = 'Bearer VALID_MOCK_TOKEN';

// 1. Sync User first (to ensure we exist in DB and have 'farm' role)
const authData = JSON.stringify({
    role: 'farm',
    fullName: 'Test Farm Owner'
});

const farmData = JSON.stringify({
    name: 'VinEco Nam Dinh',
    address: 'Giao Thuy, Nam Dinh',
    description: 'High-tech greenhouse farm',
    certification: 'VietGAP',
    location_coords: '20.2, 106.3'
});

function sendRequest(path, method, data, callback) {
    const options = {
        hostname: HOST,
        port: PORT,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': MOCK_TOKEN,
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log(`[${method} ${path}] STATUS: ${res.statusCode}`);
            try {
                const json = JSON.parse(body);
                callback(null, json);
            } catch (e) {
                callback(e, body);
            }
        });
    });

    req.on('error', e => callback(e));
    req.write(data);
    req.end();
}

console.log('--- Step 1: Sync User (Ensure Farm Role) ---');
sendRequest(AUTH_PATH, 'POST', authData, (err, res) => {
    if (err) return console.error('Auth Failed:', err);
    console.log('User synced:', res.user.email);

    console.log('\n--- Step 2: Create Farm ---');
    sendRequest(CREATE_FARM_PATH, 'POST', farmData, (err, res) => {
        if (err) return console.error('Create Farm Failed:', err);
        console.log('Farm Created:', res);
    });
});
