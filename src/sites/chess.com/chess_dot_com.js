const {BaseSite} = require("../base_site");


class ChessDotCom extends BaseSite {
    SITE_URL = 'https://www.chess.com'

    authenticate = async (manual = true) => {
        await this.puppeteer.goto('https://www.chess.com/login');

        if (!manual) {
            const username = process.env.USERNAME;
            const password = process.env.PASSWORD;

            await this.puppeteer.$eval('#username', (el, user) => el.value = user, username);
            await this.puppeteer.$eval('#password', (el, pass) => el.value = pass, password);
            await this.puppeteer.click('#login');
        }
    }

    waitForSiteToBeReady = async () => {
        await this.puppeteer.waitForSelector('#quick-link-new_game');
    }


}

module.exports = {
    ChessDotCom
}