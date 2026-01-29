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
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Create a fake hash based on data + random
                const dataString = JSON.stringify(data);
                const randomNonce = crypto.randomBytes(4).toString('hex');
                const hash = crypto.createHash('sha256').update(dataString + randomNonce).digest('hex');
                const mockTxHash = `0x${hash}`;

                console.log(`[MOCK BLOCKCHAIN] Simulated transaction for data:`, data);
                console.log(`[MOCK BLOCKCHAIN] Returned TxHash: ${mockTxHash}`);

                resolve(mockTxHash);
            }, 500); // 500ms delay
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
