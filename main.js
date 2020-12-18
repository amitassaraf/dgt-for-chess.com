const {TAGS} = require('./constants');
const {connect} = require('./livechess');
const {BrowserWindow, app} = require("electron");
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");
require('dotenv').config();
const {Chess} = require('chess.js')
const say = require('say');


const main = async () => {
    await pie.initialize(app);
    const browser = await pie.connect(app, puppeteer);
    const chess = new Chess();
    let move = 'w', castling = 'KQkq', enpessuant = '-', whiteMove = 0, blackMove = 1;

    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    const url = "https://www.chess.com/";
    await window.loadURL(url);

    const page = await pie.getPage(browser, window);
    await page.goto('https://www.chess.com/login');
    await page.$eval('#username', el => el.value = process.env.USERNAME);
    await page.$eval('#password', el => el.value = process.env.PASSWORD);
    await page.click('#login');
    await page.waitForSelector('#quick-link-new_game');
    await page.goto('https://www.chess.com/play/online');

    const onNewBoard = (fen) => {
        chess.load(`${fen} ${move} ${castling} ${enpessuant} ${whiteMove} ${blackMove}`);
        if (move === 'w') {
            move = 'b';
            whiteMove += 1;
        } else if (move === 'b') {
            move = 'w';
            blackMove += 1;
        }
        console.log(chess.ascii());
    }

    const parsePieceDataDetails = (pieceData) => {
        const pieceType = /piece ([wb][pkqnb])/g.exec(pieceData.class)[1];
        const square = /square-([0-9]+)/g.exec(pieceData.class)[1];
        return {pieceType, square};
    }

    async function onPieceRemovedOrAdded(oldValue, newValue) {
        if (!newValue) {
            // Piece captured
            const {pieceType, square} = parsePieceDataDetails(oldValue);
            if (pieceType && square) {
                console.log(`Piece ${pieceType} on Square ${square} was captured.`);
                await evaluateAndListen(false, false, true); // Refresh piece listeners
            }
        }
        if (!oldValue) {
            // Piece captured
            const {pieceType, square} = parsePieceDataDetails(newValue);
            if (pieceType && square) {
                console.log(`Either a backwards move or a pawn was promoted to ${pieceType}.`);
                await evaluateAndListen(false, false, true); // Refresh piece listeners
            }
        }

    }

    async function onPieceMoved(pieceData, attributeChanged, oldValue, newValue) {
        const {pieceType, square} = parsePieceDataDetails(pieceData)
        const originalSquare = /square-([0-9]+)/g.exec(oldValue)[1];
        if (pieceType && originalSquare && square && attributeChanged === 'class' && originalSquare !== square) {
            say.speak(`Piece ${pieceType} moved from Square ${originalSquare} to Square ${square}`)
            console.log(`Piece ${pieceType} moved from Square ${originalSquare} to Square ${square}`);
        }
    }

    async function onChessboardChange(oldValue, newValue) {
        if (oldValue.tag === TAGS.CHESS_BOARD) {
            await evaluateAndListen(false, true, true);
            console.log(`${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}`);
        }
    }

    const evaluateAndListen = async (initial, board, pieces) => {
        await page.evaluate((initial, board, pieces) => {
            const getNodeData = (node) => {
                return {
                    'class': node.getAttribute('class'),
                    'tag': node.tagName
                }
            };


            if (board) {
                const targetNode = document.querySelector('chess-board');

                if (document.boardObserver) {
                    document.boardObserver.disconnect();
                }

                document.boardObserver = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            window.onPieceRemovedOrAdded(
                                mutation.removedNodes[0] && getNodeData(mutation.removedNodes[0]),
                                mutation.addedNodes[0] && getNodeData(mutation.addedNodes[0]),
                            );
                        }

                    }
                });
                document.boardObserver.observe(
                    targetNode,
                    {childList: true},
                );
            }

            if (pieces) {
                const pieces = document.querySelectorAll('.piece');

                if (document.piecesObserver) {
                    document.piecesObserver.disconnect();
                }

                document.piecesObserver = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'attributes') {
                            window.onPieceMoved(
                                getNodeData(mutation.target),
                                mutation.attributeName,
                                mutation.oldValue,
                                mutation.target[mutation.attributeName]
                            );
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
            }

            if (initial) {
                const target = document.querySelector('.board-layout-chessboard');

                if (document.globalObserver) {
                    document.globalObserver.disconnect();
                }

                document.globalObserver = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            window.onChessboardChange(
                                mutation.removedNodes[0] && getNodeData(mutation.removedNodes[0]),
                                mutation.addedNodes[0] && getNodeData(mutation.addedNodes[0]),
                            );
                        }

                    }
                });
                document.globalObserver.observe(
                    target,
                    {childList: true, attributes: true},
                );
            }


        }, initial, board, pieces);
    }

    await page.exposeFunction('onChessboardChange', onChessboardChange);
    await page.exposeFunction('onPieceRemovedOrAdded', onPieceRemovedOrAdded);
    await page.exposeFunction('onPieceMoved', onPieceMoved);

    await evaluateAndListen(true, true, true);

    connect(onNewBoard);

    // window.destroy();
};

main();