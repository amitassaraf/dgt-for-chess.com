const {ipcMain} = require('electron');
const {BrowserView} = require("electron");
const isDev = require('electron-is-dev');
const path = require('path');
const {BOARD_STATUS} = require("../constants");
const {WINDOW_HEIGHT} = require("../constants");
const {WINDOW_WIDTH} = require("../constants");

const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`;

class WidgetManager {
    constructor(window) {
        this.window = window;
        this.boardStatusView = null;
    }

    setup = () => {
        this.boardStatusView = new BrowserView({
            webPreferences: {
                nodeIntegration: true,
            }
        })

        this.window.setBrowserView(this.boardStatusView)
        this.boardStatusView.setBounds({x: WINDOW_WIDTH - 310, y: WINDOW_HEIGHT - 110, width: 300, height: 100});
        this.boardStatusView.webContents.loadURL(startURL)

        this._setupIPC();
    }

    _setupIPC = () => {
        ipcMain.on('ping', (event, arg) => {
            event.reply('pong', '');
        });
    }

    updateWidgetDetails = async (gameManager, boardManager) => {
        this.boardStatusView.webContents.send('connection', JSON.stringify({status: boardManager.boardConnected ? BOARD_STATUS.CONNECTED : BOARD_STATUS.CONNECTING}));
        this.boardStatusView.webContents.send('battery', JSON.stringify({status: boardManager.batteryStatus}));
        this.boardStatusView.webContents.send('turn', JSON.stringify({turn: gameManager.getTurn()}));
    }
}

module.exports = {
    WidgetManager
}