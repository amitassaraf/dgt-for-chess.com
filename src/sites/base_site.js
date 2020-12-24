class BaseSite {
    SITE_URL = null;

    constructor() {
        this.puppeteer = undefined;
        this.currentGamePage = undefined;
    }

    navigateAndInitialize = async (browser, window, pie) => {
        await window.loadURL(this.SITE_URL);
        this.puppeteer = await pie.getPage(browser, window);
    }

    navigateToGamePage = async (gamePage) => {
        this.currentGamePage = gamePage;
        this.currentGamePage.puppeteer = this.puppeteer;
        await this.puppeteer.goto(`${this.SITE_URL}${this.currentGamePage.PAGE_SUB_URL}`);
        await this.currentGamePage.waitForPageToLoad();
        await this.currentGamePage.exposeBasePageFunctions();
        await this.currentGamePage.initializeListeners();
    }

    authenticate = async () => {}
    waitForSiteToBeReady = async () => {}
    initializeListeners = async () => {}

}

module.exports = {
    BaseSite
}