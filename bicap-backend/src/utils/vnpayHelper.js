const crypto = require('crypto');
const querystring = require('querystring');

/**
 * VNPay Payment Helper
 * Tích hợp thanh toán VNPay vào hệ thống
 */

class VNPayHelper {
    constructor() {
        // Lấy config từ environment variables
        this.vnp_TmnCode = process.env.VNPAY_TMN_CODE || '';
        this.vnp_HashSecret = process.env.VNPAY_HASH_SECRET || '';
        this.vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        this.vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5001/api/payments/vnpay-return';
        this.vnp_IpAddr = process.env.VNPAY_IP_ADDR || '127.0.0.1';
    }

    /**
     * Tạo mã tham chiếu giao dịch (TxnRef)
     * Format: {type}{timestamp}{random}
     * @param {string} type - Loại giao dịch: 'SUB' (subscription), 'ORD' (order)
     * @param {number} id - ID của subscription hoặc order
     * @returns {string} - Mã tham chiếu
     */
    generateTxnRef(type, id) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${type}${timestamp}${id}${random}`;
    }

    /**
     * Tạo secure hash cho VNPay
     * @param {Object} params - Object chứa các tham số
     * @returns {string} - Secure hash
     */
    createSecureHash(params) {
        // Sắp xếp params theo thứ tự alphabet và tạo query string
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                    result[key] = params[key];
                }
                return result;
            }, {});

        const signData = querystring.stringify(sortedParams, null, null, {
            encodeURIComponent: (str) => {
                return querystring.escape(str);
            }
        });

        // Tạo hash SHA512
        const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
        hmac.update(signData);
        return hmac.digest('hex');
    }

    /**
     * Tạo payment URL cho VNPay
     * @param {Object} paymentData - Dữ liệu thanh toán
     * @param {number} paymentData.amount - Số tiền (VND)
     * @param {string} paymentData.orderId - ID đơn hàng hoặc subscription
     * @param {string} paymentData.orderInfo - Thông tin đơn hàng
     * @param {string} paymentData.orderType - Loại đơn hàng
     * @param {string} paymentData.locale - Ngôn ngữ (vn/en)
     * @param {string} paymentData.txnRef - Mã tham chiếu (nếu không có sẽ tự tạo)
     * @param {string} paymentData.ipAddr - IP address của client
     * @returns {Object} - { paymentUrl, txnRef, secureHash }
     */
    createPaymentUrl(paymentData) {
        const {
            amount,
            orderId,
            orderInfo = 'Thanh toan don hang',
            orderType = 'other',
            locale = 'vn',
            txnRef = null,
            ipAddr = null
        } = paymentData;

        // Validate
        if (!this.vnp_TmnCode || !this.vnp_HashSecret) {
            throw new Error('VNPay configuration is missing. Please check VNPAY_TMN_CODE and VNPAY_HASH_SECRET in .env');
        }

        if (!amount || amount <= 0) {
            throw new Error('Invalid amount');
        }

        // Tạo TxnRef nếu chưa có
        const finalTxnRef = txnRef || this.generateTxnRef(orderType.substring(0, 3).toUpperCase(), orderId);

        // Tạo date string theo format VNPay yêu cầu
        const createDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '';

        // Tạo expire date (15 phút sau)
        const expireDate = new Date(Date.now() + 15 * 60 * 1000)
            .toISOString()
            .replace(/[-:]/g, '')
            .split('.')[0] + '';

        // Chuẩn bị params
        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.vnp_TmnCode,
            vnp_Amount: Math.round(amount * 100), // VNPay yêu cầu số tiền nhân 100
            vnp_CurrCode: 'VND',
            vnp_TxnRef: finalTxnRef,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: orderType,
            vnp_Locale: locale,
            vnp_ReturnUrl: this.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr || this.vnp_IpAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate
        };

        // Tạo secure hash
        const secureHash = this.createSecureHash(vnp_Params);
        vnp_Params.vnp_SecureHash = secureHash;

        // Tạo payment URL
        const paymentUrl = this.vnp_Url + '?' + querystring.stringify(vnp_Params, null, null, {
            encodeURIComponent: (str) => {
                return querystring.escape(str);
            }
        });

        return {
            paymentUrl,
            txnRef: finalTxnRef,
            secureHash,
            params: vnp_Params
        };
    }

    /**
     * Xác thực callback từ VNPay
     * @param {Object} queryParams - Query parameters từ VNPay callback
     * @returns {Object} - { isValid, data }
     */
    verifyCallback(queryParams) {
        try {
            const {
                vnp_SecureHash,
                vnp_TxnRef,
                vnp_ResponseCode,
                vnp_TransactionNo,
                vnp_TransactionStatus,
                vnp_Amount,
                ...otherParams
            } = queryParams;

            // Tạo lại hash để so sánh
            const secureHash = this.createSecureHash({
                ...otherParams,
                vnp_TxnRef,
                vnp_ResponseCode,
                vnp_TransactionNo,
                vnp_TransactionStatus,
                vnp_Amount
            });

            // So sánh hash
            const isValid = secureHash === vnp_SecureHash;

            return {
                isValid,
                data: {
                    txnRef: vnp_TxnRef,
                    responseCode: vnp_ResponseCode,
                    transactionNo: vnp_TransactionNo,
                    transactionStatus: vnp_TransactionStatus,
                    amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : null, // Chia 100 để lấy số tiền thực
                    secureHash: vnp_SecureHash,
                    otherParams
                }
            };
        } catch (error) {
            console.error('Error verifying VNPay callback:', error);
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * Kiểm tra response code từ VNPay
     * @param {string} responseCode - Mã phản hồi
     * @returns {Object} - { success, message }
     */
    checkResponseCode(responseCode) {
        const responseCodes = {
            '00': { success: true, message: 'Giao dịch thành công' },
            '07': { success: false, message: 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)' },
            '09': { success: false, message: 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking' },
            '10': { success: false, message: 'Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần' },
            '11': { success: false, message: 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch' },
            '12': { success: false, message: 'Thẻ/Tài khoản bị khóa' },
            '13': { success: false, message: 'Nhập sai mật khẩu xác thực giao dịch (OTP)' },
            '51': { success: false, message: 'Tài khoản không đủ số dư để thực hiện giao dịch' },
            '65': { success: false, message: 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày' },
            '75': { success: false, message: 'Ngân hàng thanh toán đang bảo trì' },
            '79': { success: false, message: 'Nhập sai mật khẩu thanh toán quá số lần quy định' },
            '99': { success: false, message: 'Lỗi không xác định' }
        };

        return responseCodes[responseCode] || { success: false, message: 'Mã lỗi không xác định' };
    }
}

// Export singleton instance
module.exports = new VNPayHelper();





