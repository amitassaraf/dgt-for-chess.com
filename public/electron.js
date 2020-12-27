const {BrowserWindow, app} = require("electron");
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");
const {ipcMain} = require('electron');
const {WINDOW_HEIGHT} = require("../src/constants");
const {WINDOW_WIDTH} = require("../src/constants");
const {ComputerPage} = require("../src/sites/chess.com/pages/computer");
const {ExplorerPage} = require("../src/sites/chess.com/pages/explorer");
const {OnlinePage} = require("../src/sites/chess.com/pages/online");
const {ChessDotCom} = require("../src/sites/chess.com/chess_dot_com");
const {DGTAsyncBoardManager} = require("../src/board/dgtasync");
const {LiveChessBoardManager} = require("../src/board/livechess");
const {GameManager} = require("../src/game_manager");
const {WidgetManager} = require("../src/views/widget_manager");
require('dotenv').config();
const _ = require('lodash');


const main = async () => {
    await pie.initialize(app);
    const browser = await pie.connect(app, puppeteer);
    const gameManager = new GameManager();
    let boardManager;
    const siteManager = new ChessDotCom();


    const window = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        title: 'DGT For Chess'
    });

    window.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });

    const widgetManager = new WidgetManager(window);


    widgetManager.createView('select_connection', WINDOW_WIDTH / 2 - 250, WINDOW_HEIGHT / 2 - 250, 500, 500);

    ipcMain.on('conType', (event, args) => {
        if (args === 'livechess') {
            boardManager = new LiveChessBoardManager();
        } else {
            boardManager = new DGTAsyncBoardManager();
        }

        boardManager.spawn();

        widgetManager.resetView();
    })

    await siteManager.navigateAndInitialize(browser, window, pie);
    await siteManager.authenticate();
    await siteManager.waitForSiteToBeReady();

    const GAME_MODES = [ExplorerPage, ComputerPage, OnlinePage];

    await siteManager.puppeteer.setDefaultNavigationTimeout(0);

    while (!_.some(GAME_MODES.map((page) => siteManager.puppeteer.url().endsWith(new page().PAGE_SUB_URL)))) {
        await siteManager.puppeteer.waitForNavigation();
    }

    // Game Mode Detected
    const Page = GAME_MODES.filter((page) => siteManager.puppeteer.url().endsWith(new page().PAGE_SUB_URL))[0];
    widgetManager.createView('status_card', WINDOW_WIDTH - 310, WINDOW_HEIGHT - 110, 300, 100);
    await siteManager.navigateToGamePage(new Page(widgetManager, gameManager, boardManager));
    await widgetManager.updateWidgetDetails(siteManager.currentGamePage, gameManager, boardManager);


};

main();