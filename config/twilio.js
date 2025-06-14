const twilio = require('twilio');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

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

const sendWhatsAppMessage = async (from, to, message) => {
    try {
        // Asegurarse de que los números tengan el formato correcto
        const formattedFrom = from.startsWith('+') ? from : `+${from}`;
        const formattedTo = to.startsWith('+') ? to : `+${to}`;
        
        const messageConfig = {
            to: `whatsapp:${formattedTo}`,
            from: `whatsapp:${formattedFrom}`,
            body: message
        };

        console.log('Enviando mensaje con configuración:', {
            from: messageConfig.from,
            to: messageConfig.to,
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