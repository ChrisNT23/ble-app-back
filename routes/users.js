const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para registro de usuarios
router.post('/register', userController.register);

// Ruta para login de usuarios
router.post('/login', userController.login);

module.exports = router; 