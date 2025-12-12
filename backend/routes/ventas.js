const router = require('express').Router();
const Venta = require('../models/Venta');


router.get('/', async (req, res) => {
    try {
        
        const ventas = await Venta.find().sort({ createdAt: -1 });
        res.json(ventas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/', async (req, res) => {
    const venta = new Venta(req.body);
    try {
        const nuevaVenta = await venta.save();
        res.status(201).json(nuevaVenta);
    } catch (err) {
        res.status(400).json({ message: "Error guardando venta: " + err.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const ventaActualizada = await Venta.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );
        res.json(ventaActualizada);
    } catch (err) {
        res.status(400).json({ message: "Error actualizando venta: " + err.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        await Venta.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venta eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;