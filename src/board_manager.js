const {BOARD_WEBSOCKET} = require("./constants");
const spawn = require("child_process").spawn;


class BoardManager {
    constructor(boardCallback) {
        this.boardConnected = false;
        this.boardCallback = boardCallback
        this.process = undefined;
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

    getBoard = async () => {
        if (this.boardConnected) {
            const ws = new WebSocket(`ws://${BOARD_WEBSOCKET.HOSTNAME}:${BOARD_WEBSOCKET.PORT}/`);
            ws.on('open', function open() {
                ws.send('get_board');
            });
        }
    }
}

module.exports = {
    BoardManager
}