const {COLUMN_TO_LETTER} = require('./constants');
const {Chess} = require('chess.js')

const PIECE_CLASS = '.piece';

const parsePieceAndSquareFromClass = (className) => {
    const piece = /([wb][pkqnbr])/g.exec(className);
    const square = /square-([0-9]+)/g.exec(className);

    if (!piece || !square) {
        throw Error(`Could not find piece in ${className}`);
    }

    return {color: piece[1][0], type: piece[1][1], row: square[1][1], column: square[1][0]};
}


const chessDotComSquareToPGN = (squareCode) => {
    const column = COLUMN_TO_LETTER[squareCode[0]];
    const row = squareCode[1];
    return `${column}${row}`;
}

const squareObjectToPGN = (square) => {
    const column = COLUMN_TO_LETTER[square?.column];
    const row = square?.row;
    return `${column}${row}`;
}

const squareObjectToChessDotCom = (square) => {
    const column = square.column;
    const row = square.row;
    return `${column}${row}`;
}

const pgnToChessDotComSquare = (pngCode) => {
    const column = Object.keys(COLUMN_TO_LETTER).find(key => COLUMN_TO_LETTER[key] === pngCode[0]);
    const row = pngCode[1];
    return `${column}${row}`;
}

const chessDotComToSquareObject = (squareCode) => {
    return {column: squareCode[0], row: squareCode[1]};
}

const getBoardOnChessDotCom = async (page) => {
    const chessDotComBoard = new Chess();
    chessDotComBoard.clear();
    const pieces = await page.$$(PIECE_CLASS);
    for (let piece of pieces) {
        const className = await page.evaluate(
            item => item.getAttribute('class'),
            piece,
        );
        const positionData = parsePieceAndSquareFromClass(className);
        chessDotComBoard.put({
            type: positionData.type,
            color: positionData.color
        }, squareObjectToPGN(positionData));
    }
    return chessDotComBoard;
};

module.exports = {
    chessDotComSquareToPGN,
    pgnToChessDotComSquare,
    chessDotComToSquareObject,
    getBoardOnChessDotCom,
    parsePieceAndSquareFromClass,
    squareObjectToPGN,
    squareObjectToChessDotCom
}