const https = require('http');

// Configuration
const API_URL = 'http://localhost:5001/api/auth/sync-user';
const MOCK_TOKEN = 'Bearer VALID_MOCK_TOKEN'; // This will be simulated as valid by our Mock Middleware

// Mock Data Payload (simulate what frontend sends along with the token)
const postData = JSON.stringify({
    // Firebase User Info (in real app this comes from token, but we might send extra profile info)
    role: 'farm', // Test creating a farm owner
    fullName: 'Test Farm Owner'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/sync-user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': MOCK_TOKEN,
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🚀 Sending Test Request to:', API_URL);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('RESPONSE BODY:');
        try {
            console.log(JSON.parse(data));
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();
