const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, correo, password, phone } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!nombre || !apellido || !correo || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Validar formato del número de teléfono
        if (!phone.startsWith('+593') || phone.length !== 13) {
            return res.status(400).json({
                success: false,
                message: 'El número de teléfono debe comenzar con +593 seguido de 9 dígitos'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ correo });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        // Crear nuevo usuario
        const user = new User({
            nombre,
            apellido,
            correo,
            password,
            phone
        });

        // Guardar usuario
        await user.save();

        // Generar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                phone: user.phone
            }
        });
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