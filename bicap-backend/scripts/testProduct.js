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

console.log('🚀 TEST: CREATE PRODUCT\n');

// 1. Sync User (to be safe)
const authData = JSON.stringify({ role: 'farm', fullName: 'Product Tester' });
sendRequest('/api/auth/sync-user', 'POST', authData, (err, userRes) => {
    if (err) return console.error('Auth Failed');

    // 2. Create helper farm if needed, but we can reuse existing farm ID 1 or 2 if we know they exist.
    // Let's blindly try to create a product for Farm ID 1 (Assuming it exists from previous tests)
    // If it fails, we will create a farm first.

    const productData = JSON.stringify({
        name: 'Organic Tomatoes',
        batchCode: 'BATCH-' + Date.now(),
        quantity: 500,
        farmId: 1
    });

    sendRequest('/api/products', 'POST', productData, (err, prodRes) => {
        if (err) console.error('Create Product Failed', err);

        if (prodRes.product) {
            console.log('✅ Product Created:', prodRes.product.name);
            console.log('   🔗 Hash:', prodRes.product.txHash);
        } else {
            console.log('⚠️  Could not create product for Farm 1 directly (maybe it doesn\'t exist or belongs to another user). creating new farm...');

            // Fallback: Create own farm
            const farmData = JSON.stringify({ name: 'Product Farm', address: 'Test Loc', description: 'For Products' });
            sendRequest('/api/farms', 'POST', farmData, (err, farmRes) => {
                const newFarmId = farmRes.farm.id;
                console.log('   ✅ Created new farm ID:', newFarmId);

                const newProdData = JSON.stringify({
                    name: 'Organic Tomatoes',
                    batchCode: 'BATCH-' + Date.now(),
                    quantity: 500,
                    farmId: newFarmId
                });

                sendRequest('/api/products', 'POST', newProdData, (err, newProdRes) => {
                    console.log('✅ Product Created (Retry):', newProdRes.product.name);
                    console.log('   🔗 Hash:', newProdRes.product.txHash);
                });
            });
        }
    });
});
