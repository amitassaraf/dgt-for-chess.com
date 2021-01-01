const {BrowserWindow} = require("electron");
const isDev = require('electron-is-dev');
const path = require('path');
const {BOARD_STATUS} = require("../constants");
const fs = require('fs');
const _ = require('lodash');

const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../../build/index.html')}`;
const VIEWS_FILE = 'views.json';

class WidgetManager {
    constructor(window) {
        this.window = window;
        this.views = {};

        try {
            if (fs.existsSync(VIEWS_FILE)) {
                //file exists
                this.viewsLocationData = JSON.parse(fs.readFileSync(VIEWS_FILE)) || {};
            } else {
                this.viewsLocationData = {};
            }
        } catch(err) {
            console.error(err);
            this.viewsLocationData = {};
        }

    }

    resetView = (name) => {
        this.views[name].close();
    }

    createView = (name, x, y, width, height) => {
        let location = this.viewsLocationData[name];
        const view = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
            },
            parent: this.window,
            frame: false
        });

        let locX = location && location.x || x, locY = location && location.y || y;

        view.setBounds({x: locX, y: locY, width: width, height: height});
        this.views[name] = view;
        view.webContents.on('did-finish-load', () => {
            this.sendMessageToView(name, 'component', {name: name});
        });
        view.webContents.loadURL(startURL);
        view.show();

        view.on('move', _.throttle((event) => {
            // Do move event action
            this.viewsLocationData[name] = {x: event.sender.getBounds().x, y: event.sender.getBounds().y};
            fs.writeFile(VIEWS_FILE, JSON.stringify(this.viewsLocationData, null, 2), ()=>{});
        }, 150, {'trailing': false}));
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