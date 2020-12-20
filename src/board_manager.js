const {BOARD_WEBSOCKET} = require("./constants");
const spawn = require("child_process").spawn;
const WebSocket = require('ws');
const _ = require('lodash');


class BoardManager {
    constructor(boardCallback) {
        this.boardConnected = false;
        this.boardCallback = boardCallback
        this.process = undefined;
        this.ws = undefined;
    }

    spawn = () => {
        this.process = spawn('python', ["./src/python/dgt_board_connector.py"]);
        this.process.stdout.on('data', (data) => {
            // Do something with the data returned from python script
            try {
                const message = JSON.parse(data.toString());

                switch (message.type) {
                    case 'connection':
                        this.boardConnected = message.status !== 'disconnected';
                        console.log('Board connected.');
                        this.ws = new WebSocket(`ws://${BOARD_WEBSOCKET.HOSTNAME}:${BOARD_WEBSOCKET.PORT}/`);
                        break;
                    case 'board':
                        this.boardCallback && this.boardCallback(message.fen);
                        break
                }
            } catch (e) {

            }

        });
        console.log('Spawned process.');
    }

    getBoard = _.throttle(async () => {
        if (this.boardConnected && this.ws) {
            this.ws.send('get_board');
        }
    }, 500, {'trailing': false});
}

module.exports = {
    BoardManager
}