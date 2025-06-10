const User = require('../models/User');

// Registrar un nuevo usuario
exports.register = async (req, res) => {
    try {
        const { nombre, apellido, correo, pais, password } = req.body;

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
            pais,
            password
        });

        // Enviar respuesta sin incluir la contraseña
        const userResponse = {
            _id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            pais: user.pais,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Usuario registrado exitosamente'
        });

    } catch (error) {
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

        // Enviar respuesta sin incluir la contraseña
        const userResponse = {
            _id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            pais: user.pais
        };

        res.status(200).json({
            success: true,
            data: userResponse,
            message: 'Login exitoso'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
}; 