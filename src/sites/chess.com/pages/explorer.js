const {movePieceOnChessDotComePage} = require("./utils");
const {squareObjectToPGN} = require("../utils");
const {BasePage} = require("../../base_page");
const {Chess} = require('chess.js');


const parsePieceAndSquareFromClass = (className, style) => {
    const piece = /([wb][pkqnbr])/g.exec(style);
    let square = /square-(0[1-9]0[1-9])/g.exec(className);

    if (piece === null || square === null) {
        throw Error(`Could not find piece in ${className}`);
    }

    square = square[1].replace(/0/g, '');

    return {color: piece[1][0], type: piece[1][1], row: square[1], column: square[0]};
}

const squareObjectToChessDotCom = (square) => {
    const column = square.column;
    const row = square.row;
    return `0${column}0${row}`;
}


class ExplorerPage extends BasePage {
    PAGE_SUB_URL = '/explorer';
    ANALYSIS_PAGE = true;

    waitForPageToLoad = async () => {
        await this.puppeteer.waitForSelector('.board-layout-chessboard');
    }

    initializeListeners = async () => {
        await this.puppeteer.evaluate(async () => {
            let pieces = document.querySelector('.pieces');

            if (document.globalObserver) {
                document.globalObserver.disconnect();
            }

            document.globalObserver = new MutationObserver(async (mutationsList) => {
                await window.onBoardChanged();
            });
            document.globalObserver.observe(
                pieces,
                {attributes: true, childList: true, subtree: true},
            );
        });
    }


    getBoardFromPage = async () => {
        const chessDotComBoard = new Chess();
        chessDotComBoard.clear();
        const pieces = await this.puppeteer.$$('.piece');
        for (let piece of pieces) {
            const classNameAndStyle = await this.puppeteer.evaluate(
                item => [item.getAttribute('class'), item.getAttribute('style')],
                piece,
            );
            const positionData = parsePieceAndSquareFromClass(classNameAndStyle[0], classNameAndStyle[1]);
            chessDotComBoard.put({
                type: positionData.type,
                color: positionData.color
            }, squareObjectToPGN(positionData));
        }
        return chessDotComBoard;
    };

    movePieceOnPage = async (sourceSquare, targetSquare, piece) => {
        const board = await this.puppeteer.$(`.board`);
        const boardBoundingBox = await board.boundingBox();

        const pieceNode = await this.puppeteer.$(`[class~="square-${squareObjectToChessDotCom(sourceSquare)}"][class~="piece"]`);
        const pieceBoundingBox = await pieceNode.boundingBox();

        await movePieceOnChessDotComePage(this.puppeteer, this.gameManager.playerColor, targetSquare, boardBoundingBox, pieceBoundingBox)
    };

}

module.exports = {
    ExplorerPage
}