// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

// Création des tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    adresse TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS prestation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    pu REAL NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS devis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER NOT NULL,
    date_devis DATE,
    total REAL NOT NULL,
    statue TEXT,
    client_id INTEGER,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS devis_prestation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestation_id INTEGER,
    devis_id INTEGER,
    quantity INTEGER NOT NULL,
    sous_total REAL NOT NULL,
    FOREIGN KEY(prestation_id) REFERENCES prestation(id),
    FOREIGN KEY(devis_id) REFERENCES devis(id)
  )`);
});

module.exports = db;
