const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        const { nombre, apellido, correo, password, phone } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!nombre || !apellido || !correo || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos',
                missing: {
                    nombre: !nombre,
                    apellido: !apellido,
                    correo: !correo,
                    password: !password,
                    phone: !phone
                }
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ correo });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }

        // Crear nuevo usuario
        const user = new User({
            nombre,
            apellido,
            correo,
            password,
            phone: phone.startsWith('+') ? phone : `+${phone}`
        });

        // Guardar usuario
        const savedUser = await user.save();
        console.log('Usuario guardado:', savedUser);

        // Crear y devolver el token
        const payload = {
            user: {
                id: savedUser.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('Error al generar token:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al generar token'
                    });
                }
                res.json({
                    success: true,
                    token,
                    user: {
                        id: savedUser.id,
                        nombre: savedUser.nombre,
                        apellido: savedUser.apellido,
                        correo: savedUser.correo,
                        phone: savedUser.phone
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ correo });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Crear y devolver el token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('Error al generar token:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al generar token'
                    });
                }
                res.json({
                    success: true,
                    token,
                    data: {
                        id: user.id,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        correo: user.correo,
                        phone: user.phone
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
});

module.exports = router; 