const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombreNegocio: { type: String },
    fechaRegistro: { type: Date, default: Date.now },
    // --- CORRECCIÓN: true por defecto para evitar bloqueo si falla el email ---
    isVerified: { type: Boolean, default: true }, 
    verificationToken: { type: String } 
});

module.exports = mongoose.model('User', UserSchema);