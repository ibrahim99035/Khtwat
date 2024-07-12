const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/shoes.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      sold BOOLEAN NOT NULL DEFAULT 0,
      color TEXT, -- Add color column
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )
  `);

  // Insert some default categories
  db.run(`INSERT INTO categories (name) VALUES ('Sneakers'), ('Boots'), ('Sandals'), ('Formal')`);
});

db.close();