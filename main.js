const { app, BrowserWindow, ipcMain, nativeTheme, Menu, MenuItem, dialog } = require('electron')
const path = require('node:path')
const { generateDevis } = require('./renderer/devisPdf.js');
const { generateFacture } = require('./renderer/facturePdf.js');
let win;

if (require('electron-squirrel-startup')) {
  app.quit();
}

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

//Generer le devis en pdf-------------------------------
ipcMain.handle('generate-devis', async (event, devisData, defaultFileName) => {

  // Ouvre une boîte de dialogue pour choisir où sauvegarder
  const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Enregistrer le devis",
      defaultPath: defaultFileName,
      filters: [{ name: "PDF", extensions: ["pdf"] }]
  });

  if (canceled || !filePath) return { success: false };

  // Appelle ta fonction de génération en passant le chemin choisi
  generateDevis(devisData, filePath);

  return { success: true, path: filePath };
});

//Generer la factures en pdf----------------------------------
ipcMain.handle('generate-facture', async (event, factureData, defaultFileName) => {
  // Ouvre une boîte de dialogue pour choisir où sauvegarder
  const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Enregistrer la facture",
      defaultPath: defaultFileName,
      filters: [{ name: "PDF", extensions: ["pdf"] }]
  });

  if (canceled || !filePath) return { success: false };

  // Appelle ta fonction de génération en passant le chemin choisi
  generateFacture(factureData, filePath);

  return { success: true, path: filePath };
});

//Previsualisation de la facture pdf
ipcMain.handle('preview-facture', async (event, factureData) => {
  const pdfBuffer = await generateFacture(factureData);
  const base64 = pdfBuffer.toString('base64');
  event.sender.send('preview-facture', base64); // envoie au renderer
});

//Previsualisation de le devis pdf
ipcMain.handle('preview-devis', async (event, devisData) => {
  const pdfBuffer = await generateDevis(devisData);
  const base64 = pdfBuffer.toString('base64');
  event.sender.send('preview-devis', base64); // envoie au renderer
});


const createWindow = () => {
    win = new BrowserWindow({
    width: 1500,
    height: 1000,
    icon: path.join(__dirname, 'assets/build/icons/icon.ico'),
    webPreferences: {
        nodeIntegration: true,
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
  return nativeTheme.shouldUseDarkColors
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
  const db = require('./db');

  // SELECT
  ipcMain.handle('fetchAll', (event, query, values = []) => {
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
  //SELECT un seul
  ipcMain.handle('fetchOne', (event, query, values = []) => {
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
  
  // INSERT / UPDATE / DELETE
  ipcMain.handle('executeQuery', (event, query, values = []) => {
    return new Promise((resolve, reject) => {
      db.run(query, values, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  });