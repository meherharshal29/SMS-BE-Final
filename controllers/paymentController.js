const crypto = require('crypto');
const axios = require('axios');

const pay = async (req, res) => {
    try {
        const { amount, transactionId, userId } = req.body;

        const payload = {
            merchantId: process.env.MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: userId,
            amount: Math.round(Number(amount) * 100), // Ensure Integer paise
            redirectUrl: `http://localhost:4200/status/${transactionId}`,
            redirectMode: "REDIRECT",
            callbackUrl: "https://webhook.site/test", 
            paymentInstrument: { type: "PAY_PAGE" }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const stringToHash = base64Payload + "/pg/v1/pay" + process.env.SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256}###${process.env.SALT_INDEX}`;

        const options = {
            method: 'POST',
            url: process.env.PHONEPE_API_URL,
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': process.env.MERCHANT_ID, // THIS FIXES KEY_NOT_CONFIGURED
                'Accept': 'application/json'
            },
            data: { request: base64Payload }
        };

        const response = await axios.request(options);
        
        if (response.data.success) {
            return res.status(200).json({ url: response.data.data.instrumentResponse.redirectInfo.url });
        } else {
            return res.status(400).json({ error: response.data.message });
        }

    } catch (error) {
        console.error("PHONEPE ERROR:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Gateway Error", 
            details: error.response?.data?.message || error.message 
        });
    }
};
const checkStatus = async (req, res) => {
    try {
        const { txnId } = req.params;
        const merchantId = process.env.MERCHANT_ID;
        
        const string = `/pg/v1/status/${merchantId}/${txnId}` + process.env.SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = `${sha256}###${process.env.SALT_INDEX}`;

        const options = {
            method: 'GET',
            url: `${process.env.PHONEPE_STATUS_URL}/${merchantId}/${txnId}`,
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId
            }
        };

        const response = await axios.request(options);
        res.json(response.data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { pay, checkStatus };