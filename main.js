const {TAGS, COLUMN_TO_LETTER, COLOR, COLUMNS, ROWS} = require('./constants');
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

    let remoteChessBoard = new Chess();
    let isInSync = false;
    let playerColor = COLOR.WHITE;

    let castling = 'KQkq', enpessuant = '-';

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

    const setPlayerColor = (color) => {
        if (playerColor !== color) {
            playerColor = color;
            synchronizeBoard();
            isInSync = false;
            console.log(`Setting player to ${playerColor}.`);
        }
    }

    const getBoardOnChessDotCom = async () => {
        const chessDotComBoard = new Chess();
        chessDotComBoard.clear();
        const pieces = await page.$$(`.piece`);
        for (let piece of pieces) {
            const className = await page.evaluate(
                item => item.getAttribute('class'),
                piece,
            );
            const pieceData = parsePieceDataDetails({class: className});
            chessDotComBoard.put({
                type: pieceData.pieceType[1],
                color: pieceData.pieceType[0]
            }, chessDotComSquareToPGN(pieceData.square));
        }
        return chessDotComBoard.fen();
    };

    const synchronizeBoard = async () => {
        remoteChessBoard.clear();
        const fen = await getBoardOnChessDotCom();
        remoteChessBoard.load(fen);
        console.log('Synchronized board to:');
        console.log(remoteChessBoard.ascii());
    }

    const chessDotComSquareToPGN = (squareCode) => {
        const column = COLUMN_TO_LETTER[squareCode[0]];
        const row = squareCode[1];
        return `${column}${row}`;
    }

    const pgnSquareToChessDotComSquare = (pngCode) => {
        const column = Object.keys(COLUMN_TO_LETTER).find(key => COLUMN_TO_LETTER[key] === pngCode[0]);
        const row = pngCode[1];
        return `${column}${row}`;
    }

    const isPromotion = (pieceType, square) => {
        return (pieceType[0] === COLOR.BLACK && pieceType[1] === 'p' && square[1] === '1') || (pieceType[0] === COLOR.WHITE && pieceType[1] === 'p' && square[1] === '8')
    }

    const pgnSquareToSquareObject = (pgnCode) => {
        return {column: pgnCode[0], row: pgnCode[1]};
    }

    const chessDotComSquareToSquareObject = (squareCode) => {
        return {column: squareCode[0], row: squareCode[1]};
    }

    const findRowAndColumnForPiece = (originalBoard, newBoard, piece) => {
        for (let row = 0; row < ROWS; row++) {
            for (let column = 0; column < COLUMNS; column++) {
                if (originalBoard[row][column] && originalBoard[row][column].type === piece.type && originalBoard[row][column].color === piece.color && newBoard[row][column] === null) {
                    return `${COLUMN_TO_LETTER[column + 1]}${ROWS - row}`;
                }
            }
        }
    }

    const getMovesMadeByComparingChessBoard = (originalBoard, newBoard) => {
        const originalBoardArray = originalBoard.board();
        const newBoardArray = newBoard.board();
        const diffBoardArray = [...Array(COLUMNS)].map(e => Array(ROWS));
        const newMoves = [];

        for (let row = 0; row < ROWS; row++) {
            for (let column = 0; column < COLUMNS; column++) {
                if (newBoardArray[row][column] !== null && originalBoardArray[row][column] === null) {
                    /// In-case a piece moved to a new spot
                    diffBoardArray[row][column] = `${newBoardArray[row][column].color}${newBoardArray[row][column].type}`;
                    newMoves.push({
                        ...newBoardArray[row][column],
                        to: `${COLUMN_TO_LETTER[column + 1]}${ROWS - row}`,
                        from: findRowAndColumnForPiece(originalBoardArray, newBoardArray, newBoardArray[row][column])
                    });
                } else if (originalBoardArray[row][column] !== null &&
                    newBoardArray[row][column] !== null &&
                    (originalBoardArray[row][column].type !== newBoardArray[row][column].type || originalBoardArray[row][column].color !== newBoardArray[row][column].color)) {
                    /// In-case a piece captured another piece
                    diffBoardArray[row][column] = `${newBoardArray[row][column].color}${newBoardArray[row][column].type}`;
                    newMoves.push({
                        ...newBoardArray[row][column],
                        to: `${COLUMN_TO_LETTER[column + 1]}${ROWS - row}`,
                        from: findRowAndColumnForPiece(originalBoardArray, newBoardArray, newBoardArray[row][column]),
                        captured: originalBoardArray[row][column]
                    });
                }
            }
        }
        return newMoves;
    }


    const movePiece = async (sourceSquare, piece, targetSquare) => {
        const board = await page.$(`chess-board`);
        const boardBoundingBox = await board.boundingBox();

        const pieceNode = await page.$(`[class~="square-${sourceSquare}"][class~="piece"][class~="${piece}"]`);
        const pieceBoundingBox = await pieceNode.boundingBox();

        const targetSquareObject = chessDotComSquareToSquareObject(targetSquare);

        let targetY;
        let targetX;
        if (playerColor === COLOR.BLACK) {
            targetY = (boardBoundingBox.y + boardBoundingBox.height) - ((ROWS + 1 - targetSquareObject.row) * pieceBoundingBox.height) + (pieceBoundingBox.height / 2);
            targetX = (boardBoundingBox.x) + ((COLUMNS - targetSquareObject.column) * pieceBoundingBox.width) + (pieceBoundingBox.width / 2);
        } else {
            targetY = (boardBoundingBox.y + boardBoundingBox.height) - (targetSquareObject.row * pieceBoundingBox.height) + (pieceBoundingBox.height / 2);
            targetX = (boardBoundingBox.x) + ((targetSquareObject.column - 1) * pieceBoundingBox.width) + (pieceBoundingBox.width / 2);
        }

        await page.mouse.move(pieceBoundingBox.x + pieceBoundingBox.width / 2, pieceBoundingBox.y + pieceBoundingBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetX, targetY);
        await page.mouse.up();
    };

    const onNewBoard = async (fen) => {
        const dotComFen = await getBoardOnChessDotCom();

        const newBoard = new Chess();
        newBoard.load(`${fen} ${remoteChessBoard.turn()} ${castling} ${enpessuant} ${0} ${remoteChessBoard.history().length + 1}`);

        if (dotComFen.split(' ')[0] === newBoard.fen().split(' ')[0]) {
            isInSync = true;
            remoteChessBoard = new Chess(`${fen} ${playerColor} ${castling} ${enpessuant} ${0} ${remoteChessBoard.history().length + 1}`)
            console.log('Board synced.');
        }

        const moves = getMovesMadeByComparingChessBoard(remoteChessBoard, newBoard);

        for (let move of moves) {
            if (isInSync) {
                let legalMove = new Chess(remoteChessBoard.fen()).move({to: move.to, from: move.from});
                if (isPromotion(`${move.color}${move.type}`, pgnSquareToChessDotComSquare(move.to))) {
                    legalMove = new Chess(remoteChessBoard.fen()).move({to: move.to, from: move.from, promotion: 'q'});
                }
                if (!legalMove) {
                    if (move.color !== remoteChessBoard.turn()) {
                        say.speak(`It is not your turn. [It's ${remoteChessBoard.turn()}'s]`);
                    } else {
                        say.speak(`Illegal move made.`);
                    }
                } else {
                    if (remoteChessBoard.turn() === playerColor) {
                        await movePiece(pgnSquareToChessDotComSquare(move.from), `${move.color}${move.type}`, pgnSquareToChessDotComSquare(move.to));
                    }
                }
            } else {
                console.log('Board is not synced, please sync board.')
            }
        }
    }

    const parsePieceDataDetails = (pieceData) => {
        const pieceType = /([wb][pkqnbr])/g.exec(pieceData.class)[1];
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
        if (pieceType &&
            originalSquare &&
            square &&
            attributeChanged === 'class' &&
            originalSquare !== square &&
            oldValue.indexOf('dragging') === -1) {
            say.speak(`${chessDotComSquareToPGN(square)}`);
            if (isPromotion(pieceType, square)) {
                // Black pawn promotion
                remoteChessBoard.move({
                    to: chessDotComSquareToPGN(square),
                    from: chessDotComSquareToPGN(originalSquare),
                    promotion: 'q'
                });
            } else {
                remoteChessBoard.move({
                    to: chessDotComSquareToPGN(square),
                    from: chessDotComSquareToPGN(originalSquare)
                });
            }

            console.log(`Piece ${pieceType} moved from Square ${originalSquare} to Square ${square}`);
        }
    }

    async function onChessboardChange(oldValue, newValue) {
        if (oldValue.tag === TAGS.CHESS_BOARD) {
            await evaluateAndListen(false, true, true);
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


        }, initial, board, pieces, COLOR);
    }

    await page.exposeFunction('onChessboardChange', onChessboardChange);
    await page.exposeFunction('onPieceRemovedOrAdded', onPieceRemovedOrAdded);
    await page.exposeFunction('onPieceMoved', onPieceMoved);
    await page.exposeFunction('setPlayerColor', setPlayerColor);

    await evaluateAndListen(true, true, true);

    connect(onNewBoard);

    // window.destroy();
};

main();