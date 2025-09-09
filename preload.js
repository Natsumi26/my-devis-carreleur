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
  });
