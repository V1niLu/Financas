const { contextBridge, ipcRenderer } = require('electron');
const festa = require('./js/festa.js');

console.log("✅ Preload carregado");

contextBridge.exposeInMainWorld('api', {
  addFesta: (festaData) => ipcRenderer.invoke('addFesta', festaData),
  getFesta: () => ipcRenderer.invoke('getFesta'),
  deleteFesta: (id) => ipcRenderer.invoke('deleteFesta', id),
  addFuncionario: (funcionarioData) => ipcRenderer.invoke('addFuncionario', funcionarioData),
  getFuncionario: (id_festa) => ipcRenderer.invoke('getFuncionario', id_festa),
  deleteFuncionario: (id) => ipcRenderer.invoke('deleteFuncionario', id),
});
