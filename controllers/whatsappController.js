const { sendWhatsAppMessage } = require('../config/twilio');
const twilio = require('twilio');
const User = require('../models/User');
const Settings = require('../models/Settings');

// Función para validar el número de teléfono
const validatePhoneNumber = (phoneNumber) => {
    // Eliminar espacios y caracteres especiales
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Verificar que comience con +
    if (!phoneNumber.startsWith('+')) {
        return {
            isValid: false,
            message: 'El número debe comenzar con el código de país (ej: +593)'
        };
    }

    // Verificar longitud mínima (código de país + número)
    if (cleaned.length < 10) {
        return {
            isValid: false,
            message: 'El número es demasiado corto'
        };
    }

    // Verificar longitud máxima
    if (cleaned.length > 15) {
        return {
            isValid: false,
            message: 'El número es demasiado largo'
        };
    }

    return {
        isValid: true,
        formattedNumber: phoneNumber
    };
};

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Enviar mensaje de WhatsApp
exports.sendMessage = async (req, res) => {
    try {
        const { to, message, location } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren el número de teléfono y el mensaje'
            });
        }

        // Formatear el número de teléfono
        const formattedNumber = to.startsWith('+') ? to : `+${to}`;

        // Construir el mensaje con la ubicación
        let fullMessage = message;
        if (location) {
            const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
            fullMessage += `\n\nMi ubicación actual: ${mapsUrl}`;
        }

        console.log('Enviando mensaje a:', formattedNumber);
        console.log('Mensaje:', fullMessage);

        const twilioMessage = await client.messages.create({
            body: fullMessage,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${formattedNumber}`
        });

        console.log('Mensaje enviado:', twilioMessage.sid);

        return res.json({
            success: true,
            message: 'Mensaje enviado correctamente',
            data: {
                messageId: twilioMessage.sid,
                status: twilioMessage.status
            }
        });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        
        // Manejar errores específicos de Twilio
        if (error.code === 21211) {
            return res.status(400).json({
                success: false,
                message: 'Número de teléfono inválido'
            });
        }

        if (error.code === 21614) {
            return res.status(400).json({
                success: false,
                message: 'El número no está registrado en WhatsApp'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje',
            error: error.message
        });
    }
}; 