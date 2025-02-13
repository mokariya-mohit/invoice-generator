



const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * Send invoice PDF link via WhatsApp.
 * @param {string} whatsappNumber - Recipient's WhatsApp number.
 * @param {string} pdfUrlW - Public URL of the invoice PDF.
 */
const sendWhatsApp = async (whatsappNumber, pdfUrlW) => {
    try {
        // Validate inputs
        if (!whatsappNumber || !pdfUrlW.startsWith('http')) {
            throw new Error('Invalid WhatsApp number or media URL.');
        }

        const message = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, 
            to: `whatsapp:${whatsappNumber}`, 
            body: 'Here is your invoice PDF.',
            mediaUrl: [pdfUrlW], 
        });

        return message.sid;
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error.message);
        throw new Error(`WhatsApp message failed: ${error.message}`);
    }
};

module.exports = sendWhatsApp;


