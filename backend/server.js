const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Base de Datos MongoDB Conectada'))
    .catch(err => console.error('❌ Error:', err));

app.get('/', (req, res) => res.send('API Control Carnes Funcionando 🥩'));


app.use('/auth', require('./routes/auth')); 

app.use('/api/ventas', require('./routes/ventas'));   
app.use('/api/compras', require('./routes/compras')); 


app.listen(PORT, () => console.log(`🚀 Server en http://localhost:${PORT}`));