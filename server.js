require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cors = require('cors'); // Para manejar solicitudes desde el frontend

const app = express(); // Inicializar Express

// Middleware
app.use(bodyParser.json()); // Manejar datos JSON en las solicitudes
app.use(cors()); // Permitir solicitudes desde el frontend

// Conexión a MongoDB
const uri = "mongodb+srv://Leonardo_Moya:5Whl9ZlwX43lUe8x@cluster0.a02aj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function conectarMongoDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("🟢 Conexión exitosa a MongoDB");
  } catch (error) {
    console.error("🔴 Error conectando a MongoDB:", error);
  }
}
conectarMongoDB();

// Esquema de usuario
const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    balance: { type: Number, default: 0 } // Nuevo campo para el saldo
});



// Modelo de usuario
const User = mongoose.model('User', UserSchema);


// Ruta para revisar el saldo
app.post('/api/check-balance', async (req, res)=> {
    const { email } = req.body;

    try {
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        res.status(200).send({ balance: usuario.balance });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al obtener el saldo' });
    }
});

// Ruta para depositar dinero
app.post('/api/deposit', async (req, res) => {
    const { email, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).send({ error: 'Cantidad inválida' });
    }

    try {
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        usuario.balance += amount; // Aumentar el saldo
        await usuario.save();
        res.status(200).send({ message: 'Depósito exitoso', balance: usuario.balance });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al depositar dinero' });
    }
});

app.delete('/usuarios/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const usuarioEliminado = await User.findOneAndDelete({ email });

        if (!usuarioEliminado) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        res.send({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
});



// Ruta para retirar dinero
app.post('/api/withdraw', async (req, res)=> {
    const { email, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).send({ error: 'Cantidad inválida' });
    }

    try {
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        if (usuario.balance < amount) {
            return res.status(400).send({ error: 'Fondos insuficientes' });
        }

        usuario.balance -= amount; // Reducir el saldo
        await usuario.save();
        res.status(200).send({ message: 'Retiro exitoso', balance: usuario.balance });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al retirar dinero' });
    }
});

// Ruta para registrar usuarios
app.post('/api/registro', async (req, res)  => {
    const { nombre, apellido, email, contraseña } = req.body;

    try {
        // Crear un nuevo usuario con los datos proporcionados
        const nuevoUsuario = new User({ nombre, apellido, email, contraseña });
        await nuevoUsuario.save(); // Guardar en la base de datos
        res.status(201).send({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al registrar el usuario' });
    }
});

// Ruta para verificar usuarios (iniciar sesión)
app.post('/api/login', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        // Buscar al usuario en la base de datos
        const usuario = await User.findOne({ email, contraseña });
        if (usuario) {
            res.status(200).send({ message: 'Inicio de sesión exitoso' });
        } else {
            res.status(401).send({ error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al iniciar sesión' });
    }
});

// Puerto del servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

