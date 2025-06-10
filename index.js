const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
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

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Error de autenticación' });
  }
};

// Ruta para guardar datos
app.post('/settings', isAuthenticated, async (req, res) => {
  try {
    const { name, emergencyContact, emergencyMessage } = req.body;
    const newSettings = new Settings({
      userId: req.userId,
      name,
      emergencyContact,
      emergencyMessage,
    });
    await newSettings.save();
    res.status(201).json({ message: 'Configuración guardada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
});

// Ruta para obtener los datos más recientes
app.get('/settings', isAuthenticated, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.userId }).sort({ timestamp: -1 });
    if (!settings) {
      return res.status(404).json({ error: 'No se encontraron configuraciones para este usuario' });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// Ruta para actualizar datos (editar)
app.put('/settings/:id', isAuthenticated, async (req, res) => {
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