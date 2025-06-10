const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

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

// Rutas de usuario
app.use('/api/users', userRoutes);

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
app.get('/api/settings/:userId', authenticateToken, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.params.userId }).sort({ timestamp: -1 });
    if (!settings) {
      return res.status(404).json({ error: 'No se encontraron configuraciones para este usuario' });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// Ruta para guardar datos
app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
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