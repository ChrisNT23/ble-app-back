const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Función para generar token JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d' // El token expira en 30 días
    });
};

// Registrar un nuevo usuario
exports.register = async (req, res) => {
    try {
        const { nombre, apellido, correo, password, phone } = req.body;

        console.log('Datos recibidos en el controlador:', {
            nombre,
            apellido,
            correo,
            password: '***',
            phone
        });

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ correo });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        // Crear nuevo usuario
        const user = await User.create({
            nombre,
            apellido,
            correo,
            password,
            phone
        });

        // Generar token
        const token = generateToken(user._id);

        // Enviar respuesta sin incluir la contraseña
        const userResponse = {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            phone: user.phone,
            token
        };

        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Usuario registrado exitosamente'
        });

    } catch (error) {
        console.error('Error en el controlador de registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

// Login de usuario
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ correo });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = generateToken(user._id);

        // Enviar respuesta sin incluir la contraseña
        const userResponse = {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            phone: user.phone,
            token
        };

        res.status(200).json({
            success: true,
            data: userResponse,
            message: 'Login exitoso'
        });

    } catch (error) {
        console.error('Error en el controlador de login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
}; 