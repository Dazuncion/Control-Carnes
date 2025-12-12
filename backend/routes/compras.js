const router = require('express').Router();
const Compra = require('../models/Compra');

router.get('/', async (req, res) => {
    try {
        const compras = await Compra.find().sort({ createdAt: -1 });
        res.json(compras);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


router.post('/', async (req, res) => {
    const compra = new Compra(req.body);
    try {
        const nuevaCompra = await compra.save();
        res.status(201).json(nuevaCompra);
    } catch (err) { res.status(400).json({ message: err.message }); }
});


router.put('/:id', async (req, res) => {
    try {
        const compraEditada = await Compra.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(compraEditada);
    } catch (err) { res.status(400).json({ message: err.message }); }
});


router.delete('/:id', async (req, res) => {
    try {
        await Compra.findByIdAndDelete(req.params.id);
        res.json({ message: 'Compra eliminada' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;