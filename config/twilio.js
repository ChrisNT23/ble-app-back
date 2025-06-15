const axios = require('axios');
require('dotenv').config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('Error: WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID son requeridos');
    process.exit(1);
}

const sendWhatsAppMessage = async (from, to, message) => {
    try {
        console.log('Enviando mensaje de WhatsApp:', {
            from,
            to,
            message
        });

        const response = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            data: {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: {
                    body: message
                }
            }
        });

        console.log('Mensaje enviado exitosamente:', response.data);
        return {
            success: true,
            messageId: response.data.messages[0].id
        };
    } catch (error) {
        console.error('Error detallado de WhatsApp:', error.response?.data || error.message);
        return {
            success: false,
            error: error.message,
            details: error.response?.data || error
        };
    }
};

module.exports = {
    sendWhatsAppMessage
}; 