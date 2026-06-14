const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fm', {
    window: {
        setAlwaysOnTop: (args) => ipcRenderer.invoke('window:setAlwaysOnTop', args),
        isAlwaysOnTop: () => ipcRenderer.invoke('window:isAlwaysOnTop'),
        close: () => ipcRenderer.invoke('window:close'),
        show: () => ipcRenderer.invoke('window:show'),
        toggle: () => ipcRenderer.invoke('window:toggle'),
        minimize: () => ipcRenderer.invoke('window:minimize'),
        openFolder: () => ipcRenderer.invoke('window:openFolder')
    },
    app: {
        getConfig: () => ipcRenderer.invoke('app:getConfig'),
        updateTrayMenu: () => ipcRenderer.invoke('app:updateTrayMenu')
    },
    on: {
        trayAction: (callback) => {
            ipcRenderer.on('tray:action', (event, action) => {
                callback(action);
            });
        }
    }
});
