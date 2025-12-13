const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto'); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/register', async (req, res) => {
    const { nombre, email, password, nombreNegocio } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const verificationToken = crypto.randomBytes(32).toString('hex');

        user = new User({ 
            nombre, 
            email, 
            password: hashedPassword, 
            nombreNegocio,
            verificationToken 
        });

        await user.save();
       
        // Intenta enviar correo si las variables de entorno están bien en Render
        // Si no están configuradas, no romperá el registro gracias al try/catch
        const urlVerificacion = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
        try {
            await transporter.sendMail({
                from: '"Control Carnes" <no-reply@controlcarnes.com>',
                to: email,
                subject: 'Verifica tu cuenta - Control Carnes 🥩',
                html: `
                    <h3>Hola ${nombre},</h3>
                    <p>Activa tu cuenta aquí:</p>
                    <a href="${urlVerificacion}">Verificar Cuenta</a>
                `
            });
        } catch (mailError) {
            console.log("No se pudo enviar correo (verificar vars en Render). Usuario creado igual.");
        }

        res.json({ msg: 'Registro exitoso. Ya puedes iniciar sesión.' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error en servidor');
    }
});

router.get('/verify/:token', async (req, res) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({ verificationToken: token });

        if (!user) return res.status(400).json({ msg: 'Token inválido' });
      
        user.isVerified = true;
        user.verificationToken = undefined; 
        await user.save();

        res.json({ msg: 'Cuenta verificada exitosamente' });
    } catch (err) {
        res.status(500).send('Error verificando');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

        // IMPORTANTE: Si en Render no configuraste el email, esto bloqueará el login.
        // Asegúrate de que tu modelo User.js tenga "default: true" o configura el email en Render.
        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Tu cuenta no ha sido verificada. Revisa tu correo.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, nombreNegocio: user.nombreNegocio });
        });
    } catch (err) { res.status(500).send('Error en servidor'); }
});

module.exports = router;