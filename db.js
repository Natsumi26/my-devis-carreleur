// db.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('node:path');
const { app } = require('electron');

// Chemin vers le dossier accessible en écriture
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'db.sqlite');
const sourceDbPath = path.join(process.resourcesPath, 'assets', 'db.sqlite');


let db;
function initDatabase() {
    db = new sqlite3.Database(dbPath);
    db.run("PRAGMA foreign_keys = ON");

    // Création des tables
    db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      nom TEXT NOT NULL,
      telephone TEXT,
      email TEXT,
      adresse TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS prestation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
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
      unite text NOT NULL,
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

    db.run(`CREATE TABLE IF NOT EXISTS acomptes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_acompte DATE,
      montant REAL NOT NULL,
      mode_payement TEXT,
      facture_id INTEGER,
      FOREIGN KEY(facture_id) REFERENCES factures(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date DATE,
      start_hour TIME,
      end_date DATE,
      end_hour TIME,
      title TEXT,
      description TEXT,
      devis_id INTEGER NULL,
      FOREIGN KEY(devis_id) REFERENCES devis(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS facture_prestation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prestation_id INTEGER,
      facture_id INTEGER,
      quantity INTEGER NOT NULL,
      unite TEXT NOT NULL,
      sous_total REAL NOT NULL,
      FOREIGN KEY(prestation_id) REFERENCES prestation(id) ON DELETE CASCADE,
      FOREIGN KEY(facture_id) REFERENCES factures(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS entreprise (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      logo_path TEXT,
      name TEXT NOT NULL,
      telephone TEXT,
      adresse TEXT,
      siret NUMBER 
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS parametres (
      cle TEXT PRIMARY KEY,
      valeur TEXT
    )`);
    db.run(`INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('smtp_host', 'smtp.gmail.com')`);
    db.run(`INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('smtp_port', '465')`);
    db.run(`INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('smtp_secure', 'true')`);
    });
    
  }

  // Supprimer l’ancienne base si elle existe
function resetDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base :', err.message);
      return;
    }
    console.log('Connexion SQLite fermée.');

    // Supprimer l’ancienne base
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
        console.log('Base supprimée.');
      } catch (e) {
        console.error('Erreur lors de la suppression :', e.message);
        return;
      }
    }

    initDatabase();
    window.location.reload();
  });
}
// function pour Sauvgarder la bdd
function saveDatabase(destinationPath) {
  fs.copyFileSync(dbPath, destinationPath);
}


//Fonction pour importer la bdd
function importDatabase(importedPath) {
  db.close((err) => {
    if (err) {
      console.error('Erreur fermeture DB :', err.message);
      return;
    }
    console.log('Connexion SQLite fermée.');

    try {
      // Supprimer l’ancienne base
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('Ancienne base supprimée.');
      }

      // Copier la nouvelle base
      fs.copyFileSync(importedPath, dbPath);
      console.log('Nouvelle base importée.');

      // Réinitialiser la connexion
      initDatabase();
    } catch (e) {
      console.error('Erreur import DB :', e.message);
    }
  });
}


initDatabase();

function getDb() {
  return db;
}

module.exports = {
  getDb,
  resetDatabase,
  saveDatabase,
  importDatabase
};
