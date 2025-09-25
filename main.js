const { app, BrowserWindow, ipcMain, nativeTheme, Menu, dialog } = require('electron')
const path = require('node:path')
const { generateDevis } = require('./renderer/devisPdf.js');
const { generateFacture } = require('./renderer/facturePdf.js');
const { getDb, resetDatabase, saveDatabase } = require('./db');
const ExcelJS = require('exceljs');
const fs = require('fs');
let win;

// function fetch planning
ipcMain.handle('get-planning-events', async () => {
  const db = getDb();
  return await new Promise((resolve, reject) => {
    db.all("SELECT * FROM planning", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});


//builder windows
if (require('electron-squirrel-startup')) {
  app.quit();
}

//Chemin de la bdd
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

//Reset de la bdd
ipcMain.handle('reset-database', async () => {
  try {
    resetDatabase();
    return 'Base réinitialisée avec succès';
  } catch (err) {
    return 'Erreur : ' + err.message;
  }
});

//Save bdd
ipcMain.handle('save-database', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showSaveDialog({
    title: 'Sauvegarder la base',
    defaultPath: 'MesDevisFactures.sqlite',
    filters: [{ name: 'SQLite', extensions: ['sqlite'] }]
  });

  if (result.canceled) return 'Annulé';
  try {
    saveDatabase(result.filePath);
    return 'Base sauvegardée dans : ' + result.filePath;
  } catch (err) {
    return 'Erreur : ' + err.message;
  }
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
//Import Excel
ipcMain.handle('import-excel', async (_, { table, keyColumn }) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) return null;

  const filePath = filePaths[0];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0]; // ← Sélectionne la première feuille

  const db = getDb();
  const startRow = 3;
  const lignesAjoutees = [];
  const lignesModifiees = [];

  const headerRow = sheet.getRow(2);
  const headers = headerRow.values.slice(1).map(h => h?.toString().trim().toLowerCase()); // nettoie les noms

  for (let rowNumber = startRow; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values = row.values.slice(1);

    const isFooter = values.some(val =>
      typeof val === 'string' &&
      ['nombre', 'total', 'somme', 'lignes'].some(keyword =>
        val.toLowerCase().includes(keyword)
      )
    );
    
    if (isFooter || values.length !== headers.length) continue;

    const rowData = {};
    headers.forEach((col, i) => {
      rowData[col] = values[i];
    });

    const keyValue = rowData[keyColumn];
    if (!keyValue) continue;

    const exists = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM ${table} WHERE ${keyColumn} = ?`, [keyValue], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (exists) {
      const updateFields = headers.filter(h => h !== keyColumn);
      const updateValues = updateFields.map(h => rowData[h]);
      updateValues.push(keyValue);

      const updateQuery = `UPDATE ${table} SET ${updateFields.map(h => `${h} = ?`).join(', ')} WHERE ${keyColumn} = ?`;

      await new Promise((resolve, reject) => {
        db.run(updateQuery, updateValues, err => {
          if (err) reject(err);
          else resolve();
        });
      });
      lignesModifiees.push(keyValue);
    } else {
      const insertValues = headers.map(h => rowData[h]);
      const insertQuery = `INSERT INTO ${table} (${headers.join(', ')}) VALUES (${headers.map(() => '?').join(', ')})`;

      await new Promise((resolve, reject) => {
        db.run(insertQuery, insertValues, err => {
          if (err) reject(err);
          else resolve();
        });
      });
      lignesAjoutees.push(keyValue);
    }
  }

  return {
    ajoutées: lignesAjoutees.length,
    modifiées: lignesModifiees.length,
    table
  };
});




//Export Excel
ipcMain.handle('export-excel', async (_, { table, templateRelativePath}) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: `${table}.xlsx`,
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
  });

  if (canceled || !filePath) return false;

  const dbInstance = getDb();

  const rows = await new Promise((resolve, reject) => {
    dbInstance.all(`SELECT * FROM ${table}`, [], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  const workbook = new ExcelJS.Workbook();
  workbook.xlsx = {}; // reset interne (optionnel)
  let sheet;
    const templatePath = path.join(app.getPath('userData'), templateRelativePath);
    await workbook.xlsx.readFile(templatePath);
    sheet = workbook.getWorksheet(table) || workbook.worksheets[0]; // ← utilise la bonne feuille
    console.log(templatePath)
  let startRow = 3;

  const lignes = rows.map(row =>
    Object.entries(row)
      .filter(([key]) => key !== 'id') // ⛔ exclut la colonne 'id'
      .map(([, value]) => value)
  );
  // Insère les prestations à partir de la ligne 3
    sheet.spliceRows(startRow, 0, ...lignes);

    // ➕ Calculer où se trouve le footer après insertion
const footerRowIndex = startRow + lignes.length;

// Modifier le texte dans la cellule A du footer déplacé
const footerCell = sheet.getCell(`A${footerRowIndex}`);
const currentValue = footerCell.value || '';
footerCell.value = `${currentValue} ${rows.length}`;
footerCell.font = { bold: true, color: { argb: 'FFFFFFFF' }  };

    // Fige les lignes 1 et 2 (titre + en-têtes)
    sheet.views = [{ state: 'frozen', ySplit: 2 }];

  await workbook.xlsx.writeFile(filePath);
  return true;
  });

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
//-----------Function copis dossier model-------------------------
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  for (const file of files) {
    const srcFile = path.join(source, file);
    const destFile = path.join(target, file);

    if (fs.lstatSync(srcFile).isDirectory()) {
      copyFolderRecursiveSync(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}
//-----------------------
app.whenReady().then(() => {
  const sourceModelFolder = path.join(app.getAppPath(), 'assets', 'model');
  const targetModelFolder = path.join(app.getPath('userData'), 'model');

  copyFolderRecursiveSync(sourceModelFolder, targetModelFolder);
  
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
    const db = getDb();
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
  //SELECT un seul
  ipcMain.handle('fetchOne', (event, query, values = []) => {
    const db = getDb();
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
  
  // INSERT / UPDATE / DELETE
  ipcMain.handle('executeQuery', (event, query, values = []) => {
    const db = getDb();
    return new Promise((resolve, reject) => {
      db.run(query, values, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  });