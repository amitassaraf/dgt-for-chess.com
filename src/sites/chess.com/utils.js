const {COLUMN_TO_LETTER} = require('../../constants');


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

module.exports = {
    chessDotComSquareToPGN,
    pgnToChessDotComSquare,
    chessDotComToSquareObject,
    squareObjectToPGN,
    squareObjectToChessDotCom
}