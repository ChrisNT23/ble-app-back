const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { authenticateToken } = require('../middleware/auth');

// Ruta para enviar mensaje de WhatsApp
router.post('/send', authenticateToken, whatsappController.sendMessage);

module.exports = router; 