const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Base de Datos MongoDB Conectada'))
    .catch(err => console.error('❌ Error:', err));

// Ruta base para verificar estado
app.get('/', (req, res) => res.send('API Control Carnes Funcionando 🥩'));

// --- RUTAS ---
// Esta es la línea que faltaba para que funcione el Login/Register
app.use('/auth', require('./routes/auth')); 

app.use('/api/ventas', require('./routes/ventas'));   
app.use('/api/compras', require('./routes/compras')); 

// Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Server en http://localhost:${PORT}`));