const {BrowserWindow, app} = require("electron");
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");
const {ComputerPage} = require("./src/sites/chess.com/pages/computer");
const {ExplorerPage} = require("./src/sites/chess.com/pages/explorer");
const {OnlinePage} = require("./src/sites/chess.com/pages/online");
const {ChessDotCom} = require("./src/sites/chess.com/chess_dot_com");
const {BoardManager} = require("./src/board_manager");
const {GameManager} = require("./src/game_manager");
require('dotenv').config();


const main = async () => {
    await pie.initialize(app);
    const browser = await pie.connect(app, puppeteer);
    const gameManager = new GameManager();
    const boardManager = new BoardManager();
    const siteManager = new ChessDotCom();

    boardManager.spawn();

    const window = new BrowserWindow({
        width: 1200,
        height: 800
    });
    // window.webContents.openDevTools();

    await siteManager.navigateAndInitialize(browser, window, pie);
    await siteManager.authenticate();
    await siteManager.waitForSiteToBeReady();
    await siteManager.navigateToGamePage(new OnlinePage(gameManager, boardManager));


    // window.destroy();
};

main();