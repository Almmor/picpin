const { app, BrowserWindow, ipcMain, Tray, Menu, screen, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let isQuitting = false;
let isHiddenFromTray = false;

const CONFIG_FILE = 'app.json';
const ASSETS_DIR = 'assets';

let appConfig = {
    window: {
        defaultWidth: 340,
        defaultHeight: 340,
        minWidth: 200,
        minHeight: 200,
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 10,
        hideControls: true
    },
    tray: {
        tooltip: 'PicPin 📌',
        menu: [
            { label: '显示/隐藏', action: 'toggle' },
            { label: '---------', action: '' },
            { label: '📌 置顶窗口', action: 'pin' },
            { label: '⏸ 播放/暂停', action: 'play' },
            { label: '🔲 网格视图', action: 'grid' },
            { label: '---------', action: '' },
            { label: '📂 打开图片目录', action: 'openFolder' },
            { label: '---------', action: '' },
            { label: '❌ 退出', action: 'quit' }
        ]
    }
};

function loadAppConfig() {
    const cfgPath = path.join(__dirname, CONFIG_FILE);
    try {
        if (fs.existsSync(cfgPath)) {
            const raw = fs.readFileSync(cfgPath, 'utf-8');
            const loaded = JSON.parse(raw);
            if (loaded.window) appConfig.window = { ...appConfig.window, ...loaded.window };
            if (loaded.tray) appConfig.tray = { ...appConfig.tray, ...loaded.tray };
        }
    } catch (err) {
        console.warn('[PicPin] 加载 app.json 失败，使用默认配置:', err.message);
    }
}

function createTrayIcon() {
    const iconPath = path.join(__dirname, 'favicon.ico');
    let icon;
    if (fs.existsSync(iconPath)) {
        icon = nativeImage.createFromPath(iconPath);
        if (icon.isEmpty()) {
            icon = nativeImage.createEmpty();
        }
    } else {
        icon = nativeImage.createEmpty();
    }
    return icon;
}

function buildTrayMenu() {
    const menuItems = appConfig.tray.menu.map(item => {
        if (!item.action) {
            return { type: 'separator' };
        }
        return {
            label: item.label,
            click: () => {
                if (mainWindow) {
                    mainWindow.webContents.send('tray:action', item.action);
                }
            }
        };
    });
    return Menu.buildFromTemplate(menuItems);
}

function createTray() {
    const icon = createTrayIcon();
    tray = new Tray(icon);
    tray.setToolTip(appConfig.tray.tooltip || 'PicPin');
    tray.setContextMenu(buildTrayMenu());

    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
                isHiddenFromTray = true;
            } else {
                mainWindow.show();
                mainWindow.focus();
                isHiddenFromTray = false;
            }
        }
    });

    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            isHiddenFromTray = false;
        }
    });
}

function updateTrayMenu() {
    if (tray) {
        tray.setContextMenu(buildTrayMenu());
    }
}

function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const winOpts = appConfig.window;
    const winWidth = winOpts.defaultWidth || 340;
    const winHeight = winOpts.defaultHeight || 340;

    mainWindow = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        x: Math.floor(screenWidth - winWidth - 40),
        y: Math.floor(screenHeight - winHeight - 40),
        minWidth: winOpts.minWidth || 200,
        minHeight: winOpts.minHeight || 200,
        frame: false,
        transparent: true,
        resizable: true,
        alwaysOnTop: false,
        hasShadow: false,
        show: false,
        backgroundColor: '#00000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            isHiddenFromTray = true;
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow;
}

// ========== IPC 处理 ==========

ipcMain.handle('window:setAlwaysOnTop', (event, args) => {
    if (!mainWindow) return { success: false };
    const flag = args && args.isAlwaysOnTop === true;
    mainWindow.setAlwaysOnTop(flag);
    return { success: true, isAlwaysOnTop: flag };
});

ipcMain.handle('window:isAlwaysOnTop', () => {
    if (!mainWindow) return { success: false };
    return { success: true, isAlwaysOnTop: mainWindow.isAlwaysOnTop() };
});

ipcMain.handle('window:close', () => {
    if (mainWindow) {
        mainWindow.hide();
        isHiddenFromTray = true;
    }
    return { success: true };
});

ipcMain.handle('window:show', () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        isHiddenFromTray = false;
    }
    return { success: true };
});

ipcMain.handle('window:toggle', () => {
    if (!mainWindow) return { success: false };
    if (mainWindow.isVisible()) {
        mainWindow.hide();
        isHiddenFromTray = true;
    } else {
        mainWindow.show();
        mainWindow.focus();
        isHiddenFromTray = false;
    }
    return { success: true, visible: mainWindow.isVisible() };
});

ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
    return { success: true };
});

ipcMain.handle('window:openFolder', () => {
    const folderPath = path.join(__dirname, ASSETS_DIR);
    shell.openPath(folderPath);
    return { success: true };
});

ipcMain.handle('app:getConfig', () => {
    return { success: true, config: appConfig };
});

ipcMain.handle('app:updateTrayMenu', () => {
    updateTrayMenu();
    return { success: true };
});

// ========== App 生命周期 ==========

app.whenReady().then(() => {
    loadAppConfig();
    createTray();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
});

process.on('uncaughtException', (err) => {
    console.error('[PicPin] 未捕获异常:', err);
});
