const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (to, message) => {
    try {
        // Asegurarse de que el número tenga el formato correcto
        const formattedNumber = to.startsWith('+') ? to : `+${to}`;
        
        const messageConfig = {
            to: `whatsapp:${formattedNumber}`,
            from: 'whatsapp:+14155238886', // Número de WhatsApp de Twilio
            body: message
        };

        const result = await client.messages.create(messageConfig);
        return { success: true, messageId: result.sid };
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return { 
            success: false, 
            error: error.message,
            details: 'Error al enviar mensaje de WhatsApp'
        };
    }
};

module.exports = {
    sendWhatsAppMessage
}; 