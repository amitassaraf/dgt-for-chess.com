const {BrowserView} = require("electron");
const isDev = require('electron-is-dev');
const path = require('path');
const {BOARD_STATUS} = require("../constants");

const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`;

class WidgetManager {
    constructor(window) {
        this.window = window;
        this.views = {};
    }

    resetView = () => {
        this.window.setBrowserView(null);
    }

    createView = (name, x, y, width, height) => {
        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: true,
            }
        })

        this.window.setBrowserView(view);
        view.setBounds({x: x, y: y, width: width, height: height});
        this.views[name] = view;
        view.webContents.on('did-finish-load', () => {
            this.sendMessageToView(name, 'component', {name: name});
        });
        view.webContents.loadURL(startURL);
    }

    sendMessageToView = (viewName, channel, message) => {
        this.views[viewName].webContents.send(channel, JSON.stringify(message));
    }

    updateWidgetDetails = async (pageManager, gameManager, boardManager) => {
        this.sendMessageToView('status_card', 'connection', {status: boardManager.boardConnected ? BOARD_STATUS.CONNECTED : BOARD_STATUS.CONNECTING});
        this.sendMessageToView('status_card', 'battery', {status: boardManager.batteryStatus});
        this.sendMessageToView('status_card', 'sync', {sync: pageManager.isBoardInSync});
    }
}

module.exports = {
    WidgetManager
}