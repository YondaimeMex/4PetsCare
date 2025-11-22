require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// ===== Middlewares globales =====
app.use(cors());
app.use(express.json());

// ===== Ruta de prueba =====
app.get('/', (req, res) => {
  res.send('API 4PetsCare funcionando 🐾');
});

// ================== AUTENTICACIÓN ==================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }

    // verificar si ya existe
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, telefono) VALUES (?, ?, ?, ?)',
      [nombre, email, passwordHash, telefono || null]
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      userId: result.insertId,
    });
  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login correcto',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ================== MASCOTAS ==================

// GET /api/mascotas  → obtener mascotas del usuario logueado
app.get('/api/mascotas', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY creado_en DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/mascotas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/mascotas → registrar una nueva mascota
app.post('/api/mascotas', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nombre,
      especie,
      raza,
      sexo,
      fecha_nacimiento,
      peso_kg,
      esterilizado,
      foto_url,
      notas
    } = req.body;

    if (!nombre || !especie) {
      return res.status(400).json({ message: 'Nombre y especie son obligatorios' });
    }

    const [result] = await pool.query(
      `INSERT INTO mascotas 
       (usuario_id, nombre, especie, raza, sexo, fecha_nacimiento, peso_kg, esterilizado, foto_url, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        nombre,
        especie,
        raza || null,
        sexo || 'Otro',
        fecha_nacimiento || null,
        peso_kg || null,
        esterilizado ? 1 : 0,
        foto_url || null,
        notas || null
      ]
    );

    res.status(201).json({
      message: 'Mascota registrada correctamente',
      mascotaId: result.insertId,
    });
  } catch (error) {
    console.error('Error en POST /api/mascotas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// DELETE /api/mascotas/:id
app.delete('/api/mascotas/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const mascotaId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM mascotas WHERE id = ? AND usuario_id = ?',
      [mascotaId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    res.json({ message: 'Mascota eliminada correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/mascotas/:id:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ================== INICIAR SERVIDOR ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor 4PetsCare API escuchando en el puerto ' + PORT);
});
