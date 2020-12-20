const {Chess} = require('chess.js')
const {DEFAULT_CASTLING_RIGHTS, DEFAULT_EN_PASSANT, WHITE, BLACK} = require('./constants');
const say = require('say');
const {getFenWithoutAttributes} = require("./chess_utils");
const {findPossibleCaptures} = require("./game_utils");


class GameManager {
    constructor(playerColor = WHITE, startPosition = undefined) {
        this.chessBoard = new Chess(startPosition);
        this.playerColor = playerColor;
        this.castlingRights = DEFAULT_CASTLING_RIGHTS;
        this.enPassant = DEFAULT_EN_PASSANT;
        this.lastPieceRemoved = null;
        this.lastPiecePossibleCaptures = [];
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
        if (this.chessBoard.game_over()) {
            if (this.chessBoard.in_checkmate()) {
                say.speak('Checkmate.');
            } else if (this.chessBoard.in_stalemate()) {
                say.speak('Stalemate.');
            } else if (this.chessBoard.in_draw()) {
                say.speak('Draw.');
            } else if (this.chessBoard.in_threefold_repetition()) {
                say.speak('Draw by repetition.');
            } else if (this.chessBoard.insufficient_material()) {
                say.speak('Draw by insufficient material.');
            }
        } else if (this.chessBoard.in_check()) {
            say.speak('Check.')
        }
    }

    getFen = () => {
        return this.chessBoard.fen();
    }

    getTurn = () => {
        return this.chessBoard.turn();
    }

    setLastPieceRemoved = (piece) => {
        this.lastPieceRemoved = piece;
        if (piece) {
            this.lastPiecePossibleCaptures = findPossibleCaptures(`${getFenWithoutAttributes(this.getFen())} ${this.getFenAttributes()}`, this.chessBoard.board(), piece);
        } else {
            this.lastPiecePossibleCaptures = [];
        }
    }

}

module.exports = {
    GameManager
}