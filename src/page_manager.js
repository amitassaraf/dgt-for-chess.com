const {isLegalMove} = require("./game_utils");
const {isPromotion} = require("./game_utils");
const {getMovesMadeByComparingChessBoard} = require("./game_utils");
const {getFenWithoutAttributes} = require("./chess_utils");
const {COLUMNS, ROWS} = require("./constants");
const {chessDotComToSquareObject} = require("./chess_dot_com_utils");
const {getBoardOnChessDotCom} = require("./chess_dot_com_utils");
const {BLACK} = require('chess.js')
const say = require('say');
const {squareObjectToChessDotCom} = require("./chess_dot_com_utils");
const {Chess} = require('chess.js')

class PageManager {
    constructor(page, game_manager) {
        this.page = page
        this.isBoardInSync = false;
        this.game_manager = game_manager
    }

    onChessDotComBoardChange = async () => {
        await this.synchronizeBoard();
        this.isBoardInSync = false;
        console.log('Board not synced.');
    }

    synchronizeBoard = async () => {
        const chessDotComBoard = await getBoardOnChessDotCom(this.page);
        this.game_manager.loadFen(chessDotComBoard.fen());
    }

    onPhysicalBoardChange = async (currentFen) => {
        const chessDotComBoard = await getBoardOnChessDotCom(this.page);

        const physicalBoard = new Chess();
        physicalBoard.load(`${currentFen} ${this.game_manager.getFenAttributes()}`);

        if (getFenWithoutAttributes(chessDotComBoard.fen()) === getFenWithoutAttributes(physicalBoard.fen())) {
            this.isBoardInSync = true;
            this.game_manager.loadFen(`${currentFen} ${this.game_manager.getFenAttributes(this.game_manager.playerColor)}`)
            console.log('Board synced.');
        }

        const moves = getMovesMadeByComparingChessBoard(this.game_manager.chessBoard, physicalBoard);

        if (this.isBoardInSync) {
            for (let move of moves) {
                let legalMove = isLegalMove(this.game_manager.getFen(), move.from, move.to);
                if (isPromotion(move.color, move.type, move.to)) {
                    legalMove = isLegalMove(this.game_manager.getFen(), move.from, move.to, true);
                }
                if (!legalMove) {
                    if (move.color !== this.game_manager.getTurn()) {
                        say.speak(`It is not your turn. [It's ${this.game_manager.getTurn()}'s]`);
                    } else {
                        say.speak(`Illegal move made.`);
                    }
                } else {
                    if (this.game_manager.getTurn() === this.game_manager.playerColor) {
                        await this.movePiece(squareObjectToChessDotCom(move.from), `${move.color}${move.type}`, squareObjectToChessDotCom(move.to));
                    }
                }
            }
        } else {
            console.log('Board is not synced, please sync board.')
        }
    }

    movePiece = async (sourceSquare, piece, targetSquare) => {
        const board = await this.page.$(`chess-board`);
        const boardBoundingBox = await board.boundingBox();

        const pieceNode = await this.page.$(`[class~="square-${sourceSquare}"][class~="piece"][class~="${piece}"]`);
        const pieceBoundingBox = await pieceNode.boundingBox();

        const targetSquareObject = chessDotComToSquareObject(targetSquare);

        let targetY;
        let targetX;
        if (this.game_manager.playerColor === BLACK) {
            targetY = (boardBoundingBox.y + boardBoundingBox.height) - ((ROWS + 1 - targetSquareObject.row) * pieceBoundingBox.height) + (pieceBoundingBox.height / 2);
            targetX = (boardBoundingBox.x) + ((COLUMNS - targetSquareObject.column) * pieceBoundingBox.width) + (pieceBoundingBox.width / 2);
        } else {
            targetY = (boardBoundingBox.y + boardBoundingBox.height) - (targetSquareObject.row * pieceBoundingBox.height) + (pieceBoundingBox.height / 2);
            targetX = (boardBoundingBox.x) + ((targetSquareObject.column - 1) * pieceBoundingBox.width) + (pieceBoundingBox.width / 2);
        }

        await this.page.mouse.move(pieceBoundingBox.x + pieceBoundingBox.width / 2, pieceBoundingBox.y + pieceBoundingBox.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(targetX, targetY);
        await this.page.mouse.up();
    };

}

module.exports = {
    PageManager
}