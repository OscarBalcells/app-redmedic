const {ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
		width: 900,
		height: 680,
		show: false,
		webPreferences: {
			webSecurity: false,
			nodeIntegration: true
		}});

  mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);

  mainWindow.on('closed', () => mainWindow = null);

	mainWindow.webContents.on("did-finish-load", () => {
		mainWindow.show();
	})
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
