const {squareObjectToPGN} = require("./chess_dot_com_utils");
const {ROWS, COLUMNS, BLACK, WHITE, PAWN, QUEEN} = require("./constants");
const {Chess} = require('chess.js');

const isLegalMove = (position, from, to, promotion) => {
    return !!new Chess(position).move({
        to: squareObjectToPGN(to),
        from: squareObjectToPGN(from),
        promotion: promotion ? QUEEN : undefined
    })
}

const isPromotion = (color, piece, square) => {
    // Soft comparison on purpose.
    return (color === BLACK && piece === PAWN && square.row == '1') ||
        (color === WHITE && piece === PAWN && square.row == '8')
}

const findRowAndColumnForPiece = (originalBoard, newBoard, piece) => {
    for (let row = 0; row < ROWS; row++) {
        for (let column = 0; column < COLUMNS; column++) {
            if (originalBoard[row][column] &&
                originalBoard[row][column].type === piece.type &&
                originalBoard[row][column].color === piece.color &&
                newBoard[row][column] === null) {
                return {column: column + 1, row: ROWS - row};
            }
        }
    }
}

const findPossibleCaptures = (fen, board, piece) => {
    const captures = [];
    for (let row = 0; row < ROWS; row++) {
        for (let column = 0; column < COLUMNS; column++) {
            if (board[row][column] &&
                board[row][column].color !== piece.color) {
                const promotion = isPromotion(board[row][column].color, board[row][column].type, piece);
                if (isLegalMove(fen, {
                    column: column + 1,
                    row: ROWS - row
                }, piece, promotion)) {
                    captures.push({...board[row][column], column: column + 1, row: ROWS - row});
                }
            }
        }
    }
    return captures;
}

const getMovesMadeByComparingChessBoard = (originalBoard, newBoard) => {
    const originalBoardArray = originalBoard.board();
    const newBoardArray = newBoard.board();
    const newMoves = [];

    for (let row = 0; row < ROWS; row++) {
        for (let column = 0; column < COLUMNS; column++) {
            if (newBoardArray[row][column] !== null && originalBoardArray[row][column] === null) {
                /// In-case a piece moved to a new spot
                let from = findRowAndColumnForPiece(originalBoardArray, newBoardArray, newBoardArray[row][column]);
                if (!from && (((ROWS - row) === 1 && newBoardArray[row][column].color === BLACK) || ((ROWS - row) === 8 && newBoardArray[row][column].color === WHITE))) {
                    /// Promotion, look for missing pawn
                    from = findRowAndColumnForPiece(originalBoardArray, newBoardArray, {...newBoardArray[row][column], type: PAWN});
                    newMoves.push({
                        ...newBoardArray[row][column],
                        type: PAWN,
                        to: {column: column + 1, row: ROWS - row},
                        from: from,
                        promotion: newBoardArray[row][column].type
                    })
                }
                newMoves.push({
                    ...newBoardArray[row][column],
                    to: {column: column + 1, row: ROWS - row},
                    from: from
                });
            } else if (originalBoardArray[row][column] !== null &&
                newBoardArray[row][column] !== null &&
                (originalBoardArray[row][column].type !== newBoardArray[row][column].type || originalBoardArray[row][column].color !== newBoardArray[row][column].color)) {
                /// In-case a piece captured another piece
                newMoves.push({
                    ...newBoardArray[row][column],
                    to: {column: column + 1, row: ROWS - row},
                    from: findRowAndColumnForPiece(originalBoardArray, newBoardArray, newBoardArray[row][column]),
                    captured: originalBoardArray[row][column]
                });
            }
        }
    }
    return newMoves;
}


module.exports = {
    isPromotion,
    findRowAndColumnForPiece,
    getMovesMadeByComparingChessBoard,
    isLegalMove,
    findPossibleCaptures
}
