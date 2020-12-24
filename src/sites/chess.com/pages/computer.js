const {movePieceOnChessDotComePage} = require("./utils");
const {squareObjectToPGN} = require("../utils");
const {squareObjectToChessDotCom} = require("../utils");
const {BasePage} = require("../../base_page");
const {Chess} = require('chess.js');


const parsePieceAndSquareFromClass = (className) => {
    const piece = /([wb][pkqnbr])/g.exec(className);
    const square = /square-([0-9]+)/g.exec(className);

    if (!piece || !square) {
        throw Error(`Could not find piece in ${className}`);
    }

    return {color: piece[1][0], type: piece[1][1], row: square[1][1], column: square[1][0]};
}


class ComputerPage extends BasePage {
    PAGE_SUB_URL = '/play/computer';

    waitForPageToLoad = async () => {
        await this.puppeteer.waitForSelector('chess-board');
    }

    initializeListeners = async () => {
        try {
            await this.puppeteer.exposeFunction('parsePieceAndSquareFromClass', parsePieceAndSquareFromClass);
            await this.puppeteer.exposeFunction('squareObjectToChessDotCom', squareObjectToChessDotCom);
        } catch (e) {
        }

        await this.puppeteer.evaluate(async () => {
            const targetNode = document.querySelector('chess-board');
            let playerColor = await window.getPlayerColor();
            if (targetNode.classList.contains('flipped') && playerColor !== 'b') {
                await window.setPlayerColor('b');
            } else if (playerColor !== 'w') {
                await window.setPlayerColor('w');
            }

            if (document.boardObserver) {
                document.boardObserver.disconnect();
            }

            document.boardObserver = new MutationObserver(async (mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        if (mutation.removedNodes[0]) {
                            const pieceData = await window.parsePieceAndSquareFromClass(mutation.removedNodes[0].getAttribute('class'));
                            if (pieceData) {
                                window.onBoardChanged();
                            }
                        } else if (mutation.addedNodes[0]) {
                            const pieceData = await window.parsePieceAndSquareFromClass(mutation.addedNodes[0].getAttribute('class'));
                            if (pieceData) {
                                window.onBoardChanged();
                            }
                        }
                    } else if (mutation.type === 'attributes') {
                        let playerColor = await window.getPlayerColor();
                        if (mutation.target.classList.contains('flipped') &&
                            (!mutation.oldValue || !mutation.oldValue.contains('flipped')) && playerColor !== 'b') {
                            await window.setPlayerColor('b');
                        } else if (playerColor !== 'w') {
                            await window.setPlayerColor('w');
                        }
                    }

                }
            });
            document.boardObserver.observe(
                targetNode,
                {childList: true, attributes: true},
            );

            const pieces = document.querySelectorAll('.piece');

            if (document.piecesObserver) {
                document.piecesObserver.disconnect();
            }

            document.piecesObserver = new MutationObserver(async (mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes') {
                        const pieceInfo = await window.parsePieceAndSquareFromClass(mutation.target.getAttribute('class'))
                        const originalSquare = /square-([0-9]+)/g.exec(mutation.oldValue)[1];
                        if (pieceInfo &&
                            originalSquare &&
                            mutation.attributeName === 'class' &&
                            originalSquare !== await window.squareObjectToChessDotCom(pieceInfo) &&
                            mutation.oldValue.indexOf('dragging') === -1) {
                            window.onBoardChanged();
                        }
                    }

                }
            });

            for (let piece of pieces) {
                document.piecesObserver.observe(
                    piece,
                    {
                        attributes: true,
                        attributeOldValue: true,
                        attributeFilter: ['class']
                    },
                );
            }

            let target = document.querySelector('.layout-board-section');

            if (document.globalObserver) {
                document.globalObserver.disconnect();
            }

            document.globalObserver = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        if (mutation.removedNodes && mutation.removedNodes.tag === 'chess-board') {
                            window.onBoardChanged();
                        }
                    } else if (mutation.type === 'attributes') {
                        window.onBoardChanged();
                    }

                }
            });
            document.globalObserver.observe(
                target,
                {childList: true, attributes: true},
            );
        });
    }


    getBoardFromPage = async () => {
        const chessDotComBoard = new Chess();
        chessDotComBoard.clear();
        const pieces = await this.puppeteer.$$('.piece');
        for (let piece of pieces) {
            const className = await this.puppeteer.evaluate(
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

    movePieceOnPage = async (sourceSquare, targetSquare, piece) => {
        const board = await this.puppeteer.$(`chess-board`);
        const boardBoundingBox = await board.boundingBox();

        const pieceNode = await this.puppeteer.$(`[class~="square-${squareObjectToChessDotCom(sourceSquare)}"][class~="piece"][class~="${piece}"]`);
        const pieceBoundingBox = await pieceNode.boundingBox();

        await movePieceOnChessDotComePage(this.puppeteer, this.gameManager.playerColor, targetSquare, boardBoundingBox, pieceBoundingBox)
    };

}

module.exports = {
    ComputerPage
}