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

const getMovesMadeByComparingChessBoard = (originalBoard, newBoard) => {
    const originalBoardArray = originalBoard.board();
    const newBoardArray = newBoard.board();
    const newMoves = [];

    for (let row = 0; row < ROWS; row++) {
        for (let column = 0; column < COLUMNS; column++) {
            if (newBoardArray[row][column] !== null && originalBoardArray[row][column] === null) {
                /// In-case a piece moved to a new spot
                newMoves.push({
                    ...newBoardArray[row][column],
                    to: {column: column + 1, row: ROWS - row},
                    from: findRowAndColumnForPiece(originalBoardArray, newBoardArray, newBoardArray[row][column])
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
    isLegalMove
}
