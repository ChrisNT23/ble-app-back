const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../config/twilio');
const User = require('../models/User');

router.post('/send', async (req, res) => {
    try {
        const { to, message, location } = req.body;
        const userId = req.user.id; // Obtener el ID del usuario del token

        // Obtener el usuario para obtener su número de teléfono
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (!user.phone) {
            return res.status(400).json({ message: 'El usuario no tiene un número de teléfono registrado' });
        }

        // Enviar el mensaje usando el número del usuario como remitente
        const result = await sendWhatsAppMessage(user.phone, to, message);

        if (result.success) {
            res.json({ message: 'Mensaje enviado correctamente', messageId: result.messageId });
        } else {
            res.status(500).json({ 
                message: 'Error al enviar el mensaje',
                error: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ 
            message: 'Error al enviar el mensaje',
            error: error.message
        });
    }
});

module.exports = router; 