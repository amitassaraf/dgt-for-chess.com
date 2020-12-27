const {BOARD_WEBSOCKET} = require("../../constants");
const spawn = require("child_process").spawn;
const WebSocket = require('ws');
const _ = require('lodash');
const {BaseBoardManager} = require("../base_board_manager");


class DGTAsyncBoardManager extends BaseBoardManager {
    constructor(boardCallback) {
        super(boardCallback);
        this.process = undefined;
        this.ws = undefined;
    }

    spawn = () => {
        this.process = spawn('python', ["./src/board/dgtasync/dgt_board_connector.py"]);
        this.process.stdout.on('data', (data) => {
            // Do something with the data returned from python script
            try {
                const message = JSON.parse(data.toString());

                switch (message.type) {
                    case 'connection':
                        this.boardConnected = message.status !== 'disconnected';
                        console.log('Board connected.');
                        this.ws = new WebSocket(`ws://${BOARD_WEBSOCKET.HOSTNAME}:${BOARD_WEBSOCKET.PORT}/`);
                        this.ws.on('open', () => {
                            this.ws.send('get_battery');
                        });
                        break;
                    case 'board':
                        this.boardCallback && this.boardCallback(message.fen);
                        break
                    case 'battery':
                        this.batteryStatus = message.status;
                        break
                }
            } catch (e) {

            }

        });
        console.log('Spawned process.');
    }

    _getBoard = async () => {
        if (this.ws) {
            this.ws.send('get_board');
            this.ws.send('get_battery');
        }
    }
}

module.exports = {
    DGTAsyncBoardManager
}