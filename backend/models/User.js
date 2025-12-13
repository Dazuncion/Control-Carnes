const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombreNegocio: { type: String },
    fechaRegistro: { type: Date, default: Date.now },
    // --- NUEVOS CAMPOS ---
    isVerified: { type: Boolean, default: false }, // Por defecto es falso
    verificationToken: { type: String } // Aquí guardaremos el código secreto
});

module.exports = mongoose.model('User', UserSchema);