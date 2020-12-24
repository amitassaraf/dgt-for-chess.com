const {COLUMNS} = require("../../../constants");
const {BLACK} = require("../../../constants");
const {ROWS} = require("../../../constants");


const movePieceOnChessDotComePage = async (puppeteer, playerColor, targetSquare, boardBoundingBox, pieceBoundingBox) => {
    let targetY;
    let targetX;
    if (playerColor === BLACK) {
        targetY = (boardBoundingBox.y + boardBoundingBox.height) - ((ROWS + 1 - targetSquare.row) * pieceBoundingBox.height) + (pieceBoundingBox.height / 2);
        targetX = (boardBoundingBox.x) + ((COLUMNS - targetSquare.column) * pieceBoundingBox.width) + (pieceBoundingBox.width / 2);
    } else {
        targetY = (boardBoundingBox.y + boardBoundingBox.height) - (targetSquare.row * pieceBoundingBox.height) + (pieceBoundingBox.height / 2);
        targetX = (boardBoundingBox.x) + ((targetSquare.column - 1) * pieceBoundingBox.width) + (pieceBoundingBox.width / 2);
    }

    await puppeteer.mouse.move(pieceBoundingBox.x + pieceBoundingBox.width / 2, pieceBoundingBox.y + pieceBoundingBox.height / 2);
    await puppeteer.mouse.down();
    await puppeteer.mouse.move(targetX, targetY);
    await puppeteer.mouse.up();
}

module.exports = {
    movePieceOnChessDotComePage
}