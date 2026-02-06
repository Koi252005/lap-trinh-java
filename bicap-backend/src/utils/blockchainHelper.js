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
        return {
            status: 'reverted', // basic mock status
            id: txHash,
            isMock: true
        };
    }
};

module.exports = blockchainHelper;
