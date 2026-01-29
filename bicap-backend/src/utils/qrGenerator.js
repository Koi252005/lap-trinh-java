const QRCode = require('qrcode');

/**
 * QR Code Generator Utility
 * Generates QR codes for traceability links
 */

const qrGenerator = {
    /**
     * Generate QR Code as Data URL (Base64 PNG)
     * @param {string} data - Data to encode in QR code (usually a URL)
     * @param {Object} options - QR code options
     * @returns {Promise<string>} - Data URL string (data:image/png;base64,...)
     */
    generateDataURL: async (data, options = {}) => {
        try {
            const defaultOptions = {
                errorCorrectionLevel: 'H', // High error correction for better scanning
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                color: {
                    dark: '#000000',  // QR code color
                    light: '#FFFFFF'   // Background color
                },
                width: 300, // Default size
                ...options
            };

            const dataURL = await QRCode.toDataURL(data, defaultOptions);
            return dataURL;
        } catch (error) {
            console.error('Error generating QR code Data URL:', error);
            throw new Error('Không thể tạo mã QR: ' + error.message);
        }
    },

    /**
     * Generate QR Code as Buffer (PNG)
     * Useful for saving to file or streaming response
     * @param {string} data - Data to encode
     * @param {Object} options - QR code options
     * @returns {Promise<Buffer>} - PNG buffer
     */
    generateBuffer: async (data, options = {}) => {
        try {
            const defaultOptions = {
                errorCorrectionLevel: 'H',
                type: 'png',
                quality: 0.92,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                width: 300,
                ...options
            };

            const buffer = await QRCode.toBuffer(data, defaultOptions);
            return buffer;
        } catch (error) {
            console.error('Error generating QR code Buffer:', error);
            throw new Error('Không thể tạo mã QR: ' + error.message);
        }
    },

    /**
     * Generate QR Code as SVG string
     * @param {string} data - Data to encode
     * @param {Object} options - QR code options
     * @returns {Promise<string>} - SVG string
     */
    generateSVG: async (data, options = {}) => {
        try {
            const defaultOptions = {
                errorCorrectionLevel: 'H',
                type: 'svg',
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                width: 300,
                ...options
            };

            const svg = await QRCode.toString(data, defaultOptions);
            return svg;
        } catch (error) {
            console.error('Error generating QR code SVG:', error);
            throw new Error('Không thể tạo mã QR: ' + error.message);
        }
    },

    /**
     * Generate traceability URL for a season
     * @param {number} seasonId - Season ID
     * @param {string} baseUrl - Base URL (defaults to CLIENT_URL env or localhost)
     * @returns {string} - Full traceability URL
     */
    generateTraceabilityURL: (seasonId, baseUrl = null) => {
        const clientUrl = baseUrl || process.env.CLIENT_URL || 'http://localhost:3000';
        return `${clientUrl}/traceability/${seasonId}`;
    },

    /**
     * Generate traceability URL for a product
     * @param {number} productId - Product ID
     * @param {string} baseUrl - Base URL
     * @returns {string} - Full traceability URL
     */
    generateProductTraceabilityURL: (productId, baseUrl = null) => {
        const clientUrl = baseUrl || process.env.CLIENT_URL || 'http://localhost:3000';
        return `${clientUrl}/traceability/product/${productId}`;
    }
};

module.exports = qrGenerator;





