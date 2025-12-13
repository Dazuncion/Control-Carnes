const router = require('express').Router();
const Compra = require('../models/Compra');
const auth = require('../middleware/auth'); // 


router.get('/', auth, async (req, res) => {
    try {
       
        const compras = await Compra.find({ usuario: req.user.id }).sort({ createdAt: -1 });
        res.json(compras);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});


router.post('/', auth, async (req, res) => {
    
    const compra = new Compra({
        ...req.body,
        usuario: req.user.id
    });

    try {
        const nuevaCompra = await compra.save();
        res.status(201).json(nuevaCompra);
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
       
        const compraEditada = await Compra.findOneAndUpdate(
            { _id: req.params.id, usuario: req.user.id }, 
            req.body, 
            { new: true }
        );

        if (!compraEditada) {
            return res.status(404).json({ message: "Compra no encontrada o no tienes permiso para editarla" });
        }

        res.json(compraEditada);
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
       
        const compraEliminada = await Compra.findOneAndDelete({ 
            _id: req.params.id, 
            usuario: req.user.id 
        });

        if (!compraEliminada) {
            return res.status(404).json({ message: "Compra no encontrada o no tienes permiso para eliminarla" });
        }

        res.json({ message: 'Compra eliminada' });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

module.exports = router;