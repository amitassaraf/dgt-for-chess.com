const {BrowserWindow, app} = require("electron");
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");
const {WINDOW_HEIGHT} = require("./src/constants");
const {WINDOW_WIDTH} = require("./src/constants");
const {ComputerPage} = require("./src/sites/chess.com/pages/computer");
const {ExplorerPage} = require("./src/sites/chess.com/pages/explorer");
const {OnlinePage} = require("./src/sites/chess.com/pages/online");
const {ChessDotCom} = require("./src/sites/chess.com/chess_dot_com");
const {DGTAsyncBoardManager} = require("./src/board/dgtasync");
const {LiveChessBoardManager} = require("./src/board/livechess");
const {GameManager} = require("./src/game_manager");
const {WidgetManager} = require("./src/views/widget_manager");
require('dotenv').config();


const main = async () => {
    await pie.initialize(app);
    const browser = await pie.connect(app, puppeteer);
    const gameManager = new GameManager();
    const boardManager = new DGTAsyncBoardManager();
    const siteManager = new ChessDotCom();

    boardManager.spawn();

    const window = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT
    });

    const widgetManager = new WidgetManager(window);
    widgetManager.setup();

    // window.webContents.openDevTools();

    await siteManager.navigateAndInitialize(browser, window, pie);
    await siteManager.authenticate();
    await siteManager.waitForSiteToBeReady();
    await siteManager.navigateToGamePage(new ComputerPage(widgetManager, gameManager, boardManager));



    // window.destroy();
};

main();