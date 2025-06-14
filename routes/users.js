const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, correo, password, phone } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ correo });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        const user = new User({
            nombre,
            apellido,
            correo,
            password,
            phone
        });

        // Guardar usuario (la contraseña se encriptará automáticamente por el middleware)
        await user.save();

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
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
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
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
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
                if (err) throw err;
                res.json({ 
                    token,
                    data: {
                        id: user.id,
                        correo: user.correo,
                        phone: user.phone
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router; 