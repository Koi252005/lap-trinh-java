const https = require('http');

// Configuration
const HOST = 'localhost';
const PORT = 5001;
const MOCK_TOKEN = 'Bearer VALID_MOCK_TOKEN';

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

// Data Payloads
const authData = JSON.stringify({ role: 'farm', fullName: 'Season Tester' });
const farmData = JSON.stringify({ name: 'Seasonal Farm', address: 'Test Location', description: 'Testing seasons' });
// Dynamic data will be created in the flow
let seasonData = (farmId) => JSON.stringify({ name: 'Spring 2025', startDate: new Date().toISOString(), farmId: farmId });
let processData = (seasonId) => JSON.stringify({ type: 'watering', description: 'Watering the plants with automatic system', imageUrl: 'http://img.com/water.jpg' });

// Execution Flow
console.log('🚀 STARTING END-TO-END SEASON TEST\n');

// 1. Sync User
sendRequest('/api/auth/sync-user', 'POST', authData, (err, userRes) => {
    if (err || !userRes.user) return console.error('❌ Auth Failed', err || userRes);
    console.log('✅ User Synced');

    // 2. Create Farm
    sendRequest('/api/farms', 'POST', farmData, (err, farmRes) => {
        if (err || !farmRes.farm) return console.error('❌ Create Farm Failed', err || farmRes);
        const farmId = farmRes.farm.id;
        console.log(`✅ Farm Created (ID: ${farmId})`);

        // 3. Create Season
        sendRequest('/api/seasons', 'POST', seasonData(farmId), (err, seasonRes) => {
            if (err || !seasonRes.season) return console.error('❌ Create Season Failed', err || seasonRes);
            const seasonId = seasonRes.season.id;
            const txHashSeason = seasonRes.txHash;
            console.log(`✅ Season Created (ID: ${seasonId})`);
            console.log(`   🔗 Blockchain Hash: ${txHashSeason}`);

            // 4. Add Process
            sendRequest(`/api/seasons/${seasonId}/process`, 'POST', processData(seasonId), (err, processRes) => {
                if (err || !processRes.process) return console.error('❌ Add Process Failed', err || processRes);
                const txHashProcess = processRes.txHash;
                console.log(`✅ Process Logged (ID: ${processRes.process.id})`);
                console.log(`   🔗 Blockchain Hash: ${txHashProcess}`);

                console.log('\n🎉 ALL TESTS PASSED!');
            });
        });
    });
});
