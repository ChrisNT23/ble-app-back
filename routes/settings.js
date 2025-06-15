const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener configuración del usuario actual
router.get('/', settingsController.getSettings);

// Obtener configuración por ID de usuario
router.get('/:userId', settingsController.getSettingsByUserId);

// Guardar nueva configuración
router.post('/', settingsController.saveSettings);

// Actualizar configuración existente
router.put('/:id', settingsController.updateSettings);

module.exports = router; 