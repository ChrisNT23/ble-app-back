const twilio = require('twilio');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Verificar que las credenciales estén presentes
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error('Error: Las credenciales de Twilio no están configuradas correctamente');
    console.error('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
    console.error('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Presente' : 'No presente');
    throw new Error('Credenciales de Twilio no configuradas');
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

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

        console.log('Enviando mensaje con configuración:', {
            to: messageConfig.to,
            from: messageConfig.from,
            bodyLength: message.length
        });

        const result = await client.messages.create(messageConfig);
        return { success: true, messageId: result.sid };
    } catch (error) {
        console.error('Error detallado de Twilio:', error);
        return { 
            success: false, 
            error: error.message,
            details: 'Error al enviar mensaje de WhatsApp',
            code: error.code,
            status: error.status
        };
    }
};

module.exports = {
    sendWhatsAppMessage
}; 