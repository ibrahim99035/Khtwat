const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const router = express.Router();

const db = new sqlite3.Database('./database/shoes.db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all shoes
router.get('/shoes', (req, res) => {
  db.all('SELECT shoes.*, categories.name as category FROM shoes LEFT JOIN categories ON shoes.category_id = categories.id', (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Get all categories
router.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Create a new shoe
router.post('/shoes', upload.single('image'), (req, res) => {
  const { name, category_id, quantity, price, sold, color } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  db.run('INSERT INTO shoes (name, category_id, quantity, price, image, sold, color) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [name, category_id, quantity, price, image, sold, color], 
    function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Update a shoe
router.put('/shoes/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, category_id, quantity, price, sold, color } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  db.run('UPDATE shoes SET name = ?, category_id = ?, quantity = ?, price = ?, image = ?, sold = ?, color = ? WHERE id = ?', 
    [name, category_id, quantity, price, image, sold, color, id], 
    function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});
  
// Toggle sold status
router.patch('/shoes/:id/toggle-sold', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE shoes SET sold = NOT sold WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json({ changes: this.changes });
    }
  });
});

// Delete a shoe
router.delete('/shoes/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM shoes WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json({ changes: this.changes });
    }
  });

});

module.exports = router;