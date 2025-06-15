const Settings = require('../models/Settings');

// Obtener configuración del usuario actual
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne({ userId: req.userId }).sort({ timestamp: -1 });
        
        if (!settings) {
            return res.status(200).json({
                success: true,
                data: {
                    name: "",
                    emergencyContact: "",
                    emergencyMessage: ""
                }
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración',
            error: error.message
        });
    }
};

// Obtener configuración por ID de usuario
exports.getSettingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const settings = await Settings.findOne({ userId }).sort({ timestamp: -1 });
        
        if (!settings) {
            return res.status(200).json({
                success: true,
                data: {
                    name: "",
                    emergencyContact: "",
                    emergencyMessage: ""
                }
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración',
            error: error.message
        });
    }
};

// Guardar nueva configuración
exports.saveSettings = async (req, res) => {
    try {
        const { name, emergencyContact, emergencyMessage } = req.body;

        // Validar datos requeridos
        if (!name || !emergencyContact || !emergencyMessage) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Crear nueva configuración
        const newSettings = new Settings({
            userId: req.userId,
            name,
            emergencyContact,
            emergencyMessage
        });

        const savedSettings = await newSettings.save();

        res.status(201).json({
            success: true,
            data: savedSettings,
            message: 'Configuración guardada exitosamente'
        });
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar configuración',
            error: error.message
        });
    }
};

// Actualizar configuración existente
exports.updateSettings = async (req, res) => {
    try {
        const { name, emergencyContact, emergencyMessage } = req.body;
        const settingsId = req.params.id;

        // Validar datos requeridos
        if (!name || !emergencyContact || !emergencyMessage) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const updatedSettings = await Settings.findOneAndUpdate(
            { _id: settingsId, userId: req.userId },
            {
                name,
                emergencyContact,
                emergencyMessage,
                timestamp: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedSettings) {
            return res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedSettings,
            message: 'Configuración actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar configuración',
            error: error.message
        });
    }
}; 