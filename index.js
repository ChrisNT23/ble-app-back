const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/users');
const whatsappRoutes = require('./routes/whatsapp');
const settingsRoutes = require('./routes/settings');
const { sendWhatsAppMessage } = require('./config/twilio');

// Cargar variables de entorno solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
    const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    if (result.error) {
        console.error('Error cargando .env:', result.error);
    }
}

// Verificar variables de entorno críticas
const requiredEnvVars = [
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Error: Faltan las siguientes variables de entorno:');
    missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
    process.exit(1);
}

// Mostrar información de las variables de entorno (sin mostrar valores sensibles)
console.log('Variables de entorno cargadas:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Configurado' : 'No configurado');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'No configurado');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Presente' : 'No presente');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/settings', settingsRoutes);

// Definir el esquema y modelo para los datos de Settings
const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  emergencyContact: String,
  emergencyMessage: String,
  timestamp: { type: Date, default: Date.now },
});

const Settings = mongoose.model('Settings', settingsSchema);

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Ruta para obtener settings de un usuario específico
app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        const settings = await Settings.findOne({ userId: req.userId }).sort({ timestamp: -1 });
        
        if (!settings) {
            return res.status(200).json({
                name: "",
                emergencyContact: "",
                emergencyMessage: ""
            });
        }

        res.status(200).json(settings);
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

// Ruta para guardar datos
app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    // IMPORTANTE: Esta ruta SOLO guarda la configuración en la base de datos
    // NO envía mensajes de WhatsApp ni realiza ninguna otra acción
    const { name, emergencyContact, emergencyMessage } = req.body;
    const newSettings = new Settings({
      userId: req.userId,
      name,
      emergencyContact,
      emergencyMessage,
    });
    const savedSettings = await newSettings.save();
    res.status(201).json(savedSettings);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
});

// Ruta para actualizar datos
app.put('/api/settings/:id', authenticateToken, async (req, res) => {
  try {
    // IMPORTANTE: Esta ruta SOLO actualiza la configuración en la base de datos
    // NO envía mensajes de WhatsApp ni realiza ninguna otra acción
    const { name, emergencyContact, emergencyMessage } = req.body;
    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, emergencyContact, emergencyMessage, timestamp: Date.now() },
      { new: true }
    );
    
    if (!updatedSettings) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

const port = process.env.PORT;
if (!port) {
  console.error('No se proporcionó el puerto a través de process.env.PORT');
  process.exit(1);
}
app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));