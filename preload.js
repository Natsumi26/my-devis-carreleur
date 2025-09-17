const { contextBridge, ipcRenderer } = require('electron');


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
    // Ajouter
    eQuery: (query, values) => ipcRenderer.invoke('executeQuery', query, values),
  
    // Récupérer tout
    fetchAll: (query, values) => ipcRenderer.invoke('fetchAll', query, values),

    //Recupere un seul
    fetchOne: (query, values) => ipcRenderer.invoke('fetchOne', query, values),
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

