require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(__dirname));

// Configure MySQL Connection Pool for Azure Flexible Server
const poolConfig = process.env.MYSQL_CONN_STR || process.env.MYSQLCONNSTR_default 
  ? { uri: process.env.MYSQL_CONN_STR || process.env.MYSQLCONNSTR_default }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: {
        rejectUnauthorized: false // REQUIRED for Azure MySQL Flexible Server
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

const pool = mysql.createPool(poolConfig);

// Initialize DB: Creates the table in Azure MySQL automatically if missing
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ContactSubmissions (
          Id          INT             AUTO_INCREMENT PRIMARY KEY,
          FullName    VARCHAR(100)    NOT NULL,
          Email       VARCHAR(100)    NOT NULL,
          Phone       VARCHAR(50)     NOT NULL,
          Message     TEXT            NOT NULL,
          SubmittedAt DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized: 'ContactSubmissions' table ready.");
  } catch (err) {
    console.error("Database initialization failed:", err.message);
  }
}

initDb();

// Validate input data
function validateContactPayload(body) {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Full Name is required.');
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push('Email is required.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      errors.push('Invalid email format.');
    }
  }

  if (!body.phone || typeof body.phone !== 'string' || !body.phone.trim()) {
    errors.push('Phone number is required.');
  }

  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    errors.push('Message is required.');
  }

  return errors;
}

// POST endpoint for contact form submission
app.post('/api/contact', async (req, res) => {
  const validationErrors = validateContactPayload(req.body);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: validationErrors.join(' ')
    });
  }

  const { name, email, phone, message } = req.body;

  try {
    const query = `
      INSERT INTO ContactSubmissions (FullName, Email, Phone, Message)
      VALUES (?, ?, ?, ?)
    `;

    await pool.execute(query, [
      name.trim(),
      email.trim(),
      phone.trim(),
      message.trim()
    ]);

    return res.status(201).json({
      success: true,
      message: 'Message saved successfully!'
    });
  } catch (error) {
    console.error('Contact submission database error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to save your message. Please try again later.'
    });
  }
});

// GET endpoint to view saved messages clearly in your browser
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ContactSubmissions ORDER BY SubmittedAt DESC');
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Serve HTML pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rahma Medicines server running on port ${PORT}`);
});