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
  name: String,
  emergencyContact: String,
  emergencyMessage: String,
  timestamp: { type: Date, default: Date.now },
});

const Settings = mongoose.model('Settings', settingsSchema);

// Ruta para guardar datos
app.post('/settings', async (req, res) => {
  try {
    const { name, emergencyContact, emergencyMessage } = req.body;
    const newSettings = new Settings({
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
app.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.findOne().sort({ timestamp: -1 });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// Ruta para actualizar datos (editar)
app.put('/settings/:id', async (req, res) => {
  try {
    const { name, emergencyContact, emergencyMessage } = req.body;
    const updatedSettings = await Settings.findByIdAndUpdate(
      req.params.id,
      { name, emergencyContact, emergencyMessage, timestamp: Date.now() },
      { new: true }
    );
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