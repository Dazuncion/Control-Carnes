const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
    fecha: { 
        type: String, 
        required: true 
    },
    cliente: { 
        type: String, 
        required: true 
    },
   
    producto: { 
        type: String, 
        enum: ['pollo', 'res', 'cerdo', 'chivo'], 
        required: true 
    },
    peso: { 
        type: Number, 
        required: true 
    },
    precioLb: { 
        type: Number, 
        required: true 
    },
    total: { 
        type: Number, 
        required: true 
    },
    saldo: { 
        type: Number, 
        default: 0 
    },
    pagado: { 
        type: Number, 
        default: 0 
    },
   
    pagos: [
        {
            monto: Number,
            fecha: String
        }
    ],
   
    devoluciones: [
        {
            fecha: String,
            cantidad: Number,
            valor: Number,
            tipo: String
        }
    ]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Venta', VentaSchema);