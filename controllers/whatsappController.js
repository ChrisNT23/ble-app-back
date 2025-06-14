const { sendWhatsAppMessage } = require('../config/twilio');

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

// Enviar mensaje de WhatsApp
exports.sendMessage = async (req, res) => {
    try {
        const { to, message } = req.body;

        // Debug: Mostrar los datos recibidos
        console.log('Datos recibidos:', { to, message });

        // Validar que se proporcionen los campos necesarios
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el número de teléfono y el mensaje'
            });
        }

        // Validar el número de teléfono
        const validation = validatePhoneNumber(to);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        // Debug: Mostrar las credenciales de Twilio
        console.log('Credenciales Twilio:', {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN ? 'Presente' : 'No presente'
        });

        // Crear el cliente de Twilio
        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Debug: Mostrar la configuración del mensaje
        const messageConfig = {
            to: `whatsapp:${validation.formattedNumber}`,
            from: 'whatsapp:+14155238886',
            body: message
        };
        console.log('Configuración del mensaje:', messageConfig);

        // Enviar el mensaje
        const result = await client.messages.create(messageConfig);

        console.log('Mensaje enviado exitosamente:', result.sid);

        res.status(200).json({
            success: true,
            message: 'Mensaje enviado correctamente',
            messageId: result.sid
        });

    } catch (error) {
        console.error('Error detallado:', {
            message: error.message,
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo,
            stack: error.stack
        });

        // Determinar el mensaje de error específico
        let errorMessage = 'Error al enviar el mensaje de WhatsApp';
        if (error.code === 21211) {
            errorMessage = 'El número de teléfono no es válido para WhatsApp';
        } else if (error.code === 21214) {
            errorMessage = 'El número de teléfono no está registrado en WhatsApp';
        } else if (error.code === 21608) {
            errorMessage = 'No tienes permisos para enviar mensajes de WhatsApp';
        } else if (error.code === 21614) {
            errorMessage = 'El número de teléfono no está verificado en WhatsApp';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
            details: error.moreInfo || 'Error al enviar mensaje de WhatsApp',
            code: error.code
        });
    }
}; 