const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del usuario es requerido']
    },
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    emergencyContact: {
        type: String,
        required: [true, 'El contacto de emergencia es requerido'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\+593\d{9}$/.test(v);
            },
            message: 'El número de teléfono debe comenzar con +593 seguido de 9 dígitos'
        }
    },
    emergencyMessage: {
        type: String,
        required: [true, 'El mensaje de emergencia es requerido'],
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 