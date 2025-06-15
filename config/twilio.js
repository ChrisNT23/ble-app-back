const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.error('Error: TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN son requeridos');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (to, message) => {
    try {
        console.log('Enviando mensaje de WhatsApp:', {
            to,
            message
        });

        const response = await client.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${to}`
        });

        console.log('Mensaje enviado exitosamente:', response.sid);
        return {
            success: true,
            messageId: response.sid
        };
    } catch (error) {
        console.error('Error al enviar mensaje de WhatsApp:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendWhatsAppMessage
}; 