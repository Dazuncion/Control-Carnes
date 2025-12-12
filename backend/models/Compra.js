const mongoose = require('mongoose');

const CompraSchema = new mongoose.Schema({
    fecha: { type: String, required: true },
    proveedor: { type: String, required: true },
    pesoBruto: { type: Number, required: true },
    pesoTara: { type: Number, default: 0 },
    pesoNetoCalculado: { type: Number, required: true },
    cantidad: { type: Number, required: true },
    precioLb: { type: Number, required: true },
    total: { type: Number, required: true },
    saldo: { type: Number, default: 0 },
    pagado: { type: Number, default: 0 },
    tipoPago: { type: String, default: 'total' },
    // Historial de pagos
    pagos: [{ monto: Number, fecha: String }]
}, { timestamps: true });

module.exports = mongoose.model('Compra', CompraSchema);