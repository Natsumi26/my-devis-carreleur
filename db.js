// db.js
const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, 'db.sqlite'));

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    adresse TEXT
  );
  CREATE TABLE IF NOT EXISTS devis (
    id INTEGER PRIMARY KEY,
    number INTEGER NOT NULL,
    date_devis DATE,
    total REAL NOT NULL,
    statue TEXT,
    client_id INTEGER,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );
  CREATE TABLE IF NOT EXISTS prestation (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    pu REAL NOT NULL
  );
  CREATE TABLE IF NOT EXISTS devis_prestation (
    id INTEGER PRIMARY KEY,
    prestation_id INTEGER,
    devis_id INTEGER,
    quantity INTEGER NOT NULL,
    sous_total REAL NOT NULL,
    FOREIGN KEY(prestation_id) REFERENCES prestation(id),
    FOREIGN KEY(devis_id) REFERENCES devis(id)
  );
`);

module.exports = db;
