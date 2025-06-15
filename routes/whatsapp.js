const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../config/twilio');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { to, message, location } = req.body;
        console.log('Datos recibidos:', { to, message, location });
        console.log('Usuario del token:', req.user);

        // Obtener el usuario para obtener su número de teléfono
        const user = await User.findById(req.user.id);
        console.log('Usuario encontrado:', user);

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