const {Chess} = require('chess.js')
const {DEFAULT_CASTLING_RIGHTS, DEFAULT_EN_PASSANT, WHITE, BLACK} = require('./constants');
const say = require('say');
const {PAWN} = require("./constants");
const {parseSan} = require("./chess_utils");
const {PIECE_NOTATION_TO_NAME} = require("./constants");
const {squareObjectToPGN} = require("./sites/chess.com/utils");
const {getMovesMadeByComparingChessBoard} = require("./game_utils");
const {getFenWithoutAttributes} = require("./chess_utils");


class GameManager {
    constructor(playerColor = WHITE, startPosition = undefined) {
        this.chessBoard = new Chess(startPosition);
        this.playerColor = playerColor;
        this.castlingRights = DEFAULT_CASTLING_RIGHTS;
        this.enPassant = DEFAULT_EN_PASSANT;
        this.previousFen = null;
    }

    setPlayerColor = async (color) => {
        if ([WHITE, BLACK].indexOf(color) === -1) {
            throw Error(`Invalid color ${color}`);
        }

        if (this.playerColor !== color) {
            this.playerColor = color;
            console.log(`Set player to ${this.playerColor}.`);
        }
    }

    getFenAttributes = (turnOverride = undefined, enPassantOverride = undefined) => {
        if (turnOverride === undefined) {
            turnOverride = this.chessBoard.turn();
        }
        return `${turnOverride} ${this.castlingRights} ${enPassantOverride ? enPassantOverride : this.enPassant} ${0} ${this.chessBoard.history().length + 1}`
    }

    loadFen = (fen, fromSynchronize) => {
        try {
            this.chessBoard.clear();
            this.chessBoard.load(fen);

            if (fromSynchronize && this.previousFen) {
                let previousBoard = new Chess(this.previousFen);
                const moves = getMovesMadeByComparingChessBoard(previousBoard, this.chessBoard);
                if (moves) {
                    const move = moves[0];
                    if (move) {
                        this.previousFen = `${getFenWithoutAttributes(this.previousFen)} ${this.getFenAttributes(move.color)}`;
                        previousBoard = new Chess(this.previousFen);

                        if (move.type === PAWN && Math.abs(move.to.row - move.from.row) === 2) {
                            // Mark as enPassant
                            const diff = move.to.row - move.from.row;
                            this.enPassant = squareObjectToPGN({
                                column: move.to.column,
                                row: diff > 0 ? move.to.row - 1 : move.to.row + 1
                            });
                            this.chessBoard.load(`${getFenWithoutAttributes(fen)} ${this.getFenAttributes()}`)
                        } else {
                            this.enPassant = DEFAULT_EN_PASSANT;
                        }

                        const moveResult = previousBoard.move({
                            to: squareObjectToPGN(move.to),
                            from: squareObjectToPGN(move.from),
                            promotion: move.promotion
                        });
                        if (moveResult) {
                            const parsedSan = parseSan(moveResult.san);
                            if (parsedSan.capture) {
                                if (parsedSan.fromOrTo) {
                                    if (parsedSan.promotion) {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] : ''} ${parsedSan.fromOrTo} takes ${parsedSan.toIfCapture} promotes to ${PIECE_NOTATION_TO_NAME[parsedSan.promotion]}`);
                                    } else {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] : ''} ${parsedSan.fromOrTo} takes ${parsedSan.toIfCapture}`);
                                    }
                                } else {
                                    if (parsedSan.promotion) {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] + ' takes' : ''} ${parsedSan.toIfCapture} promotes to ${PIECE_NOTATION_TO_NAME[parsedSan.promotion]}`);
                                    } else {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] + ' takes' : ''} ${parsedSan.toIfCapture}`);
                                    }
                                }
                            } else if (parsedSan.castleKing) {
                                say.speak(`Castles king side.`);
                            } else if (parsedSan.castleQueen) {
                                say.speak(`Castles queen side.`);
                            } else {
                                if (parsedSan.toIfCapture) {
                                    if (parsedSan.promotion) {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] : ''} ${parsedSan.fromOrTo} to ${parsedSan.toIfCapture} and promotes to ${PIECE_NOTATION_TO_NAME[parsedSan.promotion]}.`);
                                    } else {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] : ''} ${parsedSan.fromOrTo} to ${parsedSan.toIfCapture}`);
                                    }
                                } else {
                                    if (parsedSan.promotion) {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] + ' to' : ''} ${parsedSan.fromOrTo} and promotes to ${PIECE_NOTATION_TO_NAME[parsedSan.promotion]}.`);
                                    } else {
                                        say.speak(`${parsedSan.type ? PIECE_NOTATION_TO_NAME[parsedSan.type] + ' to' : ''} ${parsedSan.fromOrTo}`);
                                    }
                                }
                            }

                            if (previousBoard.game_over()) {
                                if (previousBoard.in_checkmate()) {
                                    say.speak('Checkmate.');
                                } else if (previousBoard.in_stalemate()) {
                                    say.speak('Stalemate.');
                                } else if (previousBoard.in_draw()) {
                                    say.speak('Draw.');
                                } else if (previousBoard.in_threefold_repetition()) {
                                    say.speak('Draw by repetition.');
                                } else if (previousBoard.insufficient_material()) {
                                    say.speak('Draw by insufficient material.');
                                }
                            } else if (previousBoard.in_check()) {
                                say.speak('Check.')
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
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