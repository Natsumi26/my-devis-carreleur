// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);
db.run("PRAGMA foreign_keys = ON");

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
    total_HT REAL NOT NULL,
    taux_tva REAL NOT NULL,
    total_TTC REAL NOT NULL,
    statut TEXT,
    client_id INTEGER,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS devis_prestation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestation_id INTEGER,
    devis_id INTEGER,
    quantity INTEGER NOT NULL,
    sous_total REAL NOT NULL,
    FOREIGN KEY(prestation_id) REFERENCES prestation(id) ON DELETE CASCADE,
    FOREIGN KEY(devis_id) REFERENCES devis(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS factures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL,
    date_facture DATE,
    total_HT REAL NOT NULL,
    taux_tva REAL NOT NULL,
    total_TTC REAL NOT NULL,
    devis_id INTEGER,
    client_id INTEGER,
    FOREIGN KEY(devis_id) REFERENCES devis(id),
    FOREIGN KEY(client_id) REFERENCES clients(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS facture_prestation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestation_id INTEGER,
    facture_id INTEGER,
    quantity INTEGER NOT NULL,
    sous_total REAL NOT NULL,
    FOREIGN KEY(prestation_id) REFERENCES prestation(id) ON DELETE CASCADE,
    FOREIGN KEY(facture_id) REFERENCES factures(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS entreprise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    telephone TEXT,
    adresse TEXT
  )`);
});

module.exports = db;
