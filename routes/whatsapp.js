const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../config/twilio');
const { authenticateToken } = require('../middleware/auth');
const Settings = require('../models/Settings');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Enviar mensaje de emergencia
router.post('/send-emergency', async (req, res) => {
    try {
        // Obtener la configuración más reciente del usuario
        const settings = await Settings.findOne({ userId: req.userId }).sort({ timestamp: -1 });
        
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró configuración de emergencia'
            });
        }

        // Enviar mensaje de WhatsApp
        const result = await sendWhatsAppMessage(
            settings.emergencyContact,
            settings.emergencyMessage
        );

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Error al enviar mensaje de emergencia',
                error: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mensaje de emergencia enviado exitosamente',
            messageId: result.messageId
        });
    } catch (error) {
        console.error('Error al enviar mensaje de emergencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje de emergencia',
            error: error.message
        });
    }
});

module.exports = router; 