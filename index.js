const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// PostgreSQL bağlantısı için ayarlarımız
const pool = new Pool({
  user: 'myuser',
  host: 'my-postgres',
  database: 'mydatabase',
  password: 'mysecretpassword',
  port: 5432,
});

const createTableIfNotExists = async () => {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `;
    try {
      await pool.query(createQuery);
      console.log('Table "items" is ready');
    } catch (error) {
      console.error('Error creating table:', error);
    }
};
  
// Server başlangıcında tabloyu kontrol et
createTableIfNotExists();
  

// Veri tabanına veri ekleme
app.post('/add', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO items (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Veri tabanından tüm verileri getirme
app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Veri tabanından veri silme
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
