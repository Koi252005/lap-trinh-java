const crypto = require('crypto');

/**
 * MOCK Blockchain Helper
 * Simulates interaction with VeChain thor-devkit
 */

const blockchainHelper = {
    /**
     * Mock writing data to blockchain
     * @param {Object} data - Data to hash and "store"
     * @returns {Promise<string>} - Returns a fake Transaction Hash
     */
    writeToBlockchain: async (data) => {
        return new Promise((resolve, reject) => {
            try {
                // Validate input
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid data: data must be an object');
                }

                // Simulate network delay
                setTimeout(() => {
                    try {
                        // Create a fake hash based on data + random
                        const dataString = JSON.stringify(data);
                        const randomNonce = crypto.randomBytes(4).toString('hex');
                        const hash = crypto.createHash('sha256').update(dataString + randomNonce).digest('hex');
                        const mockTxHash = `0x${hash}`;

                        console.log(`[MOCK BLOCKCHAIN] Simulated transaction for data:`, data);
                        console.log(`[MOCK BLOCKCHAIN] Returned TxHash: ${mockTxHash}`);

                        resolve(mockTxHash);
                    } catch (hashError) {
                        console.error('[MOCK BLOCKCHAIN] Hash generation error:', hashError);
                        reject(new Error('Failed to generate blockchain hash: ' + hashError.message));
                    }
                }, 500); // 500ms delay
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Mock verifying data
     * @param {string} txHash 
     * @returns {Promise<Object>}
     */
    getTransaction: async (txHash) => {
        return new Promise((resolve, reject) => {
            try {
                // Validate input
                if (!txHash || typeof txHash !== 'string') {
                    throw new Error('Invalid transaction hash: txHash must be a non-empty string');
                }

                // Simulate network delay
                setTimeout(() => {
                    try {
                        // Mock transaction data
                        const mockTransaction = {
                            id: txHash,
                            status: 'success', // Mock successful transaction
                            blockNumber: Math.floor(Math.random() * 1000000),
                            timestamp: new Date().toISOString(),
                            isMock: true,
                            verified: true
                        };

                        console.log(`[MOCK BLOCKCHAIN] Retrieved transaction: ${txHash}`);
                        resolve(mockTransaction);
                    } catch (error) {
                        console.error('[MOCK BLOCKCHAIN] Transaction retrieval error:', error);
                        reject(new Error('Failed to retrieve transaction: ' + error.message));
                    }
                }, 300); // 300ms delay
            } catch (error) {
                reject(error);
            }
        });
    }
};

module.exports = blockchainHelper;
