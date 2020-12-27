const {getFenWithoutAttributes} = require("../chess_utils");
const {isPromotion} = require("../game_utils");
const {isLegalMove} = require("../game_utils");
const {getMovesMadeByComparingChessBoard} = require("../game_utils");
const {Chess} = require('chess.js');
const say = require('say');
const _ = require('lodash');
const {squareObjectToPGN} = require("./chess.com/utils");

class BasePage {
    PAGE_SUB_URL = null;
    ANALYSIS_PAGE = false;
    ANNOUNCE_REAL_PLAYER_MOVES = true;

    constructor(widgetManager, gameManager, boardManager) {
        this.gameManager = gameManager;
        this.boardManager = boardManager;
        this.widgetManager = widgetManager;
        this.isBoardInSync = false;
        this.puppeteer = undefined;
        if (this.boardManager) {
            this.boardManager.setPhysicalBoardCallback(async (fen) => {
                await this.onPhysicalBoardChange(fen);
                await this.widgetManager.updateWidgetDetails(this, this.gameManager, this.boardManager);
            });
        }
    }

    setPlayerColor = async (color, withoutBoardChange = false) => {
        await this.gameManager.setPlayerColor(color);
        this.gameManager.previousFen = null;
        if (!withoutBoardChange) {
            await this.onBoardChanged();
        }
    }

    getPlayerColor = async () => {
        return this.gameManager.playerColor;
    }

    onBoardChanged = async () => {
        try {
            await this.initializeListeners(); // Refresh piece listeners

            await this.synchronizeBoard();
            this.isBoardInSync = false;
            console.log('Board not synced.');

            await this.boardManager.getBoard();
        } catch (e) {
            console.error(e);
        }
    };

    synchronizeBoard = async () => {
        try {
            const chessBoardFromSite = await this.getBoardFromPage();
            this.gameManager.loadFen(`${getFenWithoutAttributes(chessBoardFromSite.fen())} ${this.gameManager.getFenAttributes(undefined, '-')}`, !this.ANALYSIS_PAGE, this.ANNOUNCE_REAL_PLAYER_MOVES);
        } catch (e) {
            console.error(e);
        }
    }

    movePieceOnPage = async (sourceSquare, piece, targetSquare) => {
    };

    onPhysicalBoardChange = async (currentFen) => {
        try {
            const boardFromSite = await this.getBoardFromPage();

            const physicalBoard = new Chess();
            physicalBoard.load(`${currentFen} ${this.gameManager.getFenAttributes(undefined, '-')}`);

            if (getFenWithoutAttributes(boardFromSite.fen()) === getFenWithoutAttributes(physicalBoard.fen())) {
                this.isBoardInSync = true;

                if (!this.ANALYSIS_PAGE) {
                    this.gameManager.previousFen = `${getFenWithoutAttributes(this.gameManager.getFen())} ${this.gameManager.getFenAttributes()}`;
                }

                this.gameManager.loadFen(`${currentFen} ${this.gameManager.getFenAttributes(this.ANALYSIS_PAGE ? undefined : this.gameManager.playerColor, '-')}`, this.ANALYSIS_PAGE, this.ANNOUNCE_REAL_PLAYER_MOVES);
                console.log('Board synced.');
            }

            const moves = getMovesMadeByComparingChessBoard(this.gameManager.chessBoard, physicalBoard);

            if (this.isBoardInSync) {
                for (let move of moves) {
                    let legalMove = isLegalMove(`${getFenWithoutAttributes(this.gameManager.getFen())} ${this.gameManager.getFenAttributes()}`, move.from, move.to);
                    if (isPromotion(move.color, move.type, move.to)) {
                        legalMove = isLegalMove(`${getFenWithoutAttributes(this.gameManager.getFen())} ${this.gameManager.getFenAttributes()}`, move.from, move.to, true);
                    }
                    if (!legalMove) {
                        if (move.color !== this.gameManager.getTurn()) {
                            say.speak(`It is not your turn.`);
                        } else {
                            say.speak(`Illegal move made.`);
                        }
                    } else {
                        if (this.gameManager.getTurn() === this.gameManager.playerColor || this.ANALYSIS_PAGE) {
                            await this.movePieceOnPage(move.from, move.to, `${move.color}${move.type}`);

                            // Save previous fen for en-passant analysis
                            this.gameManager.previousFen = `${getFenWithoutAttributes(this.gameManager.getFen())} ${this.gameManager.getFenAttributes()}`;

                            this.gameManager.chessBoard.load(`${getFenWithoutAttributes(this.gameManager.getFen())} ${this.gameManager.getFenAttributes()}`);
                            this.gameManager.chessBoard.move({
                                from: squareObjectToPGN(move.from),
                                to: squareObjectToPGN(move.to)
                            });
                        }
                    }
                }
            } else {
                console.log('Board is not synced, please sync board.')

            }
        } catch (e) {
            console.error(e);
        }
    }

    exposeBasePageFunctions = async () => {
        await this.puppeteer.exposeFunction('setPlayerColor', this.setPlayerColor);
        await this.puppeteer.exposeFunction('getPlayerColor', this.getPlayerColor);
        await this.puppeteer.exposeFunction('onBoardChanged', this.onBoardChanged);
        await this.puppeteer.exposeFunction('consoleLog', console.log);
    }

    getBoardFromPage = async () => {
    }
    initializeListeners = async () => {
    }
    waitForPageToLoad = async () => {
    }
}

module.exports = {
    BasePage
}