const router = require('express').Router();
const Venta = require('../models/Venta');
const auth = require('../middleware/auth');


router.get('/', auth, async (req, res) => {
    try {
   
        const ventas = await Venta.find({ usuario: req.user.id }).sort({ createdAt: -1 });
        res.json(ventas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
       
        const nuevaVenta = new Venta({
            ...req.body,
            usuario: req.user.id 
        });

        const ventaGuardada = await nuevaVenta.save();
        res.status(201).json(ventaGuardada);
    } catch (err) {
        res.status(400).json({ message: "Error guardando venta: " + err.message });
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
        
        const ventaActualizada = await Venta.findOneAndUpdate(
            { _id: req.params.id, usuario: req.user.id }, 
            req.body, 
            { new: true } 
        );

        if (!ventaActualizada) {
            return res.status(404).json({ message: "Venta no encontrada o no tienes permiso para editarla" });
        }

        res.json(ventaActualizada);
    } catch (err) {
        res.status(400).json({ message: "Error actualizando venta: " + err.message });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        
        const ventaEliminada = await Venta.findOneAndDelete({ 
            _id: req.params.id, 
            usuario: req.user.id 
        });

        if (!ventaEliminada) {
            return res.status(404).json({ message: "Venta no encontrada o no tienes permiso para eliminarla" });
        }

        res.json({ message: 'Venta eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;