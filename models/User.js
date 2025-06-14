const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    correo: {
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Validar que el número de teléfono tenga el formato correcto
                return /^\+?[1-9]\d{1,14}$/.test(v);
            },
            message: props => `${props.value} no es un número de teléfono válido!`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 