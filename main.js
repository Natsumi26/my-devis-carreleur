const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const sqlite = require("sqlite-electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
  })

  win.loadFile('./renderer/index.html')
}

app.whenReady().then(() => {

    
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  // Définir le chemin de la base (synchronique)
  sqlite.setdbPath(path.join(__dirname, "db.sqlite"));

  // --- Création des tables (exécuté une seule fois au démarrage)
const createTables = () => {
  sqlite.executeScript(`
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
}

createTables();

// --- Communication avec le renderer
ipcMain.handle("run-query", (event, query, params = []) => sqlite.run(query, params));
ipcMain.handle("get-all", (event, query, params = []) => sqlite.all(query, params));
