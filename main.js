const {TAGS} = require('./src/constants');
const {connect} = require('./livechess');
const {BrowserWindow, app} = require("electron");
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");
require('dotenv').config();
const {BLACK, WHiTE} = require('chess.js')
const say = require('say');
const {chessDotComSquareToPGN} = require("./src/chess_dot_com_utils");
const {PageManager} = require("./src/page_manager");
const {GameManager} = require("./src/game_manager");
const {parsePieceAndSquareFromClass} = require("./src/chess_dot_com_utils");


const main = async () => {
    await pie.initialize(app);
    const browser = await pie.connect(app, puppeteer);
    const gameManager = new GameManager();

    const window = new BrowserWindow({
        width: 1200,
        height: 800
    });

    // window.webContents.openDevTools();

    const url = "https://www.chess.com/";
    await window.loadURL(url);

    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    const page = await pie.getPage(browser, window);
    await page.goto('https://www.chess.com/login');
    await page.$eval('#username', (el, user) => el.value = user, username);
    await page.$eval('#password', (el, pass) => el.value = pass, password);
    await page.click('#login');
    await page.waitForSelector('#quick-link-new_game');
    await page.goto('https://www.chess.com/play/computer');
    await page.waitForSelector('chess-board');

    const pageManager = new PageManager(page, gameManager);


    async function onPieceRemovedOrAdded(oldValue, newValue) {
        if (!newValue) {
            // Piece captured
            const pieceData = parsePieceAndSquareFromClass(oldValue.class);
            if (pieceData) {
                await evaluateAndListen(false, false, true); // Refresh piece listeners
                await pageManager.onChessDotComBoardChange();
            }
        }
        if (!oldValue) {
            // Piece captured
            const pieceData = parsePieceAndSquareFromClass(newValue);
            if (pieceData) {
                await evaluateAndListen(false, false, true); // Refresh piece listeners
                await pageManager.onChessDotComBoardChange();
            }
        }

    }

    async function onPieceMoved(pieceData, attributeChanged, oldValue, newValue) {
        const {pieceType, square} = parsePieceAndSquareFromClass(pieceData)
        const originalSquare = /square-([0-9]+)/g.exec(oldValue)[1];
        if (pieceType &&
            originalSquare &&
            square &&
            attributeChanged === 'class' &&
            originalSquare !== square &&
            oldValue.indexOf('dragging') === -1) {
            say.speak(`${chessDotComSquareToPGN(square)}`);
            await pageManager.onChessDotComBoardChange();
        }
    }

    async function onChessboardChange(oldValue, newValue) {
        if (oldValue.tag === TAGS.CHESS_BOARD) {
            await evaluateAndListen(false, true, true);
            await pageManager.onChessDotComBoardChange();
        }
    }

    const evaluateAndListen = async (initial, board, pieces) => {
        await page.evaluate((initial, board, pieces, COLOR) => {
            const getNodeData = (node) => {
                return {
                    'class': node.getAttribute('class'),
                    'tag': node.tagName
                }
            };


            if (board) {
                const targetNode = document.querySelector('chess-board');
                if (targetNode.classList.contains('flipped')) {
                    window.setPlayerColor(COLOR.BLACK);
                } else {
                    window.setPlayerColor(COLOR.WHITE);
                }

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
                        } else if (mutation.type === 'attributes') {
                            if (mutation.target.classList.contains('flipped')) {
                                window.setPlayerColor(COLOR.BLACK, targetNode.classList);
                            } else {
                                window.setPlayerColor(COLOR.WHITE, targetNode.classList);
                            }
                        }

                    }
                });
                document.boardObserver.observe(
                    targetNode,
                    {childList: true, attributes: true},
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
                let target = document.querySelector('.board-layout-chessboard');
                if (!target) {
                    target = document.querySelector('.layout-board-section');
                }

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


        }, initial, board, pieces, {BLACK, WHiTE});
    }

    await page.exposeFunction('onChessboardChange', onChessboardChange);
    await page.exposeFunction('onPieceRemovedOrAdded', onPieceRemovedOrAdded);
    await page.exposeFunction('onPieceMoved', onPieceMoved);
    await page.exposeFunction('setPlayerColor', gameManager.setPlayerColor);

    await evaluateAndListen(true, true, true);

    connect(pageManager.onPhysicalBoardChange);

    // window.destroy();
};

main();