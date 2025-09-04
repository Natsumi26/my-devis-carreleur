const { app, BrowserWindow, ipcMain, nativeTheme, Menu, MenuItem   } = require('electron')
const path = require('node:path')
const sqlite = require("sqlite-electron");

let win;
const createWindow = () => {
    win = new BrowserWindow({
    width: 1200,
    height: 1000,
    icon: path.join(__dirname, 'build/icons/icon.ico'),
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      }
    
  })
  //Icon qui saute sur la barre de tache
  win.once('focus', () => win.flashFrame(false))
  win.flashFrame(true)
  //-------
  win.loadFile('./renderer/index.html')
}
//dark mode-------------
ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})
//-----------------------
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

  app.on('ready', () => {
    const template = [
      ...(process.platform === 'darwin' ? [{
        label: app.name,
        submenu: [
          { role: 'about', label: 'À propos' },
          { type: 'separator' },
          { role: 'services', label: 'Services' },
          { type: 'separator' },
          { role: 'hide', label: 'Masquer' },
          { role: 'hideOthers', label: 'Masquer les autres' },
          { role: 'unhide', label: 'Tout afficher' },
          { type: 'separator' },
          { role: 'quit', label: 'Quitter' }
        ]
      }] : []),
      {
        label: 'Fichier',
        submenu: [
          {
            label: 'Accueil',
            accelerator: 'CmdOrCtrl+H',
            click: async () => {
              await win.loadFile('./renderer/index.html');
            }
          },
          {
            label: 'Les clients',
            accelerator: 'CmdOrCtrl+C',
            click: async () => {
              await win.loadFile('./renderer/clients.html');
            }
          },
          {
            label: 'Les prestations',
            accelerator: 'CmdOrCtrl+P',
            click: async () => {
              await win.loadFile('./renderer/prestations.html');
            }
          },
          {
            label: 'Les devis',
            click: async () => {
              await win.loadFile('./renderer/devis.html');
            }
          },
          process.platform === 'darwin' ? { role: 'close', label: "Quitter" } : { role: 'quit' , label: "Quitter" }
        ]
      },
      {
        label: 'Edition',
        submenu: [
          { role: 'undo', label: "Annuler" },
          { role: 'redo', label: "Rétablir" },
          { type: 'separator' },
          { role: 'cut', label: "Couper",accelerator: 'CmdOrCtrl+X' },
          { role: 'copy', label: "Copier", accelerator: 'CmdOrCtrl+C' },
          { role: 'paste', label: "Coller", accelerator: 'CmdOrCtrl+V' },
          { role: 'selectAll', label: 'Tout sélectionner', accelerator: 'CmdOrCtrl+A' }
        ]
      },
      {
        label: 'Affichage',
        submenu: [
        { role: 'reload', label: 'Recharger', accelerator: 'CmdOrCtrl+R' },
        { role: 'toggleDevTools', label: 'Outils développeur', accelerator: 'CmdOrCtrl+I' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom par défaut' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
        ]
      },
      {
        role: 'help',
        label: 'Aide',
        submenu: [
          {
            label: 'Documentation Electron',
            click: async () => {
              const { shell } = require('electron');
              await shell.openExternal('https://electronjs.org');
            }
          }
        ]
      }
    ];
  
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  });



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

// GET clients
ipcMain . handle ( "fetchAll" ,  async  ( event ,  query ,  values  = [])  =>  { 
    return  await  sqlite . fetchAll ( query ,  values) ; 
  } ) ;
// faire un POST/UPDATE/DELETE
ipcMain . handle ( "executeQuery" ,  async  ( event ,  query ,  values)  =>  { 
    return  await  sqlite . executeQuery ( query ,  values) ; 
  } ) ;