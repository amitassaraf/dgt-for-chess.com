const {Chess} = require('chess.js')
const {DEFAULT_CASTLING_RIGHTS, DEFAULT_EN_PASSANT, WHITE, BLACK} = require('./constants');
const say = require('say');
const {parseSan} = require("./chess_utils");
const {PIECE_NOTATION_TO_NAME} = require("./constants");
const {squareObjectToPGN} = require("./chess_dot_com_utils");
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

    loadFen = (fen, fromSynchronize) => {
        const prevFen = `${getFenWithoutAttributes(this.getFen())} ${this.getFenAttributes()}`;
        this.chessBoard.clear();
        this.chessBoard.load(fen);

        if (fromSynchronize) {
            this.previousFen = prevFen;
            let previousBoard = new Chess(this.previousFen);
            const moves = getMovesMadeByComparingChessBoard(previousBoard, this.chessBoard);
            if (moves) {
                const move = moves[0];
                if (move) {
                    this.previousFen = `${getFenWithoutAttributes(this.previousFen)} ${this.getFenAttributes(move.color)}`;
                    previousBoard = new Chess(this.previousFen);

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