const {Chess} = require('chess.js')
const {DEFAULT_CASTLING_RIGHTS, DEFAULT_EN_PASSANT, WHITE, BLACK} = require('./constants');


class GameManager {
    constructor(playerColor = WHITE, startPosition = undefined) {
        this.chessBoard = new Chess(startPosition);
        this.playerColor = playerColor;
        this.castlingRights = DEFAULT_CASTLING_RIGHTS;
        this.enPassant = DEFAULT_EN_PASSANT;
    }

    setPlayerColor = (color) => {
        if ([WHITE, BLACK].indexOf(color) === -1) {
            throw Error(`Invalid color ${color}`);
        }

        if (this.playerColor !== color) {
            this.playerColor = color;
            console.log(`Set player to ${this.playerColor}.`);
        }
    }

    getFenAttributes = (turnOverride = undefined) => {
        if (turnOverride === undefined) {
            turnOverride = this.chessBoard.turn();
        }
        return `${turnOverride} ${this.castlingRights} ${this.enPassant} ${0} ${this.chessBoard.history().length + 1}`
    }

    loadFen = (fen) => {
        this.chessBoard.clear();
        this.chessBoard.load(fen);
    }

    getFen = () => {
        return this.chessBoard.fen();
    }

    getTurn = () => {
        return this.chessBoard.turn();
    }

}

module.exports = {
    GameManager
}