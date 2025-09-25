const { contextBridge, ipcRenderer} = require('electron');
const fs = require('fs/promises'); // pour utiliser les fonctions async comme writeFile
const fsSync = require('fs'); 
const path = require('path');


contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  //Nous pouvons exposer des variables en plus des fonctions
})
//Gestion du dark
contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})

//CRUD
contextBridge.exposeInMainWorld('api', {
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  joinPath: (...args) => path.join(...args),
  extname: (filename) => path.extname(filename),
  writeFile: (filePath, buffer) => fs.writeFile(filePath, buffer),
  readdir: (dirPath) => fs.readdir(dirPath),
  unlink: (filePath) => fs.unlink(filePath),
  ensureDir: async (dirPath) => {
    if (!fsSync.existsSync(dirPath)) {
      fsSync.mkdirSync(dirPath, { recursive: true });
    }
  },
    // Ajouter
    eQuery: (query, values) => ipcRenderer.invoke('executeQuery', query, values),
    // Récupérer tout
    fetchAll: (query, values) => ipcRenderer.invoke('fetchAll', query, values),
    //Recupere un seul
    fetchOne: (query, values) => ipcRenderer.invoke('fetchOne', query, values),
    //Gestion bdd
    resetDatabase: () => ipcRenderer.invoke('reset-database'),
    saveDatabase: () => ipcRenderer.invoke('save-database'),
    getPlanning: () => ipcRenderer.invoke('get-planning-events'),
  });

//export function
  contextBridge.exposeInMainWorld('pdfAPI', {
    generateDevis: (data, defaultFileName) => ipcRenderer.invoke('generate-devis', data, defaultFileName),
    generateFacture: (data, defaultFileName) => ipcRenderer.invoke('generate-facture', data, defaultFileName)
});

//function pour visualiser la facture
contextBridge.exposeInMainWorld('factureAPI', {
  previewFacture: (factureData) => ipcRenderer.invoke('preview-facture', factureData),
  onPreview: (callback) => ipcRenderer.on('preview-facture', (event, base64) => callback(base64))
});

//function pour visualiser le devis
contextBridge.exposeInMainWorld('devisAPI', {
  previewDevis: (devisData) => ipcRenderer.invoke('preview-devis', devisData),
  onPreview: (callback) => ipcRenderer.on('preview-devis', (event, base64) => callback(base64))
});

//function pour la gestion des excel (import et export)
contextBridge.exposeInMainWorld('excelAPI', {
  importTable: (table, keyColumn) => ipcRenderer.invoke('import-excel', {table, keyColumn}),
  exportTable: (table, templateRelativePath) => ipcRenderer.invoke('export-excel', { table, templateRelativePath })
});


