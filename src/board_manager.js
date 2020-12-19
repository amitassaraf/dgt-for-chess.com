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

        });
        console.log('Spawned process.');
    }

    getBoard = async () => {
        if (this.boardConnected) {
            const ws = new WebSocket(`ws://127.0.0.1:9991/`);
            ws.on('open', function open() {
                console.log('getting');
                ws.send('get_board');
                ws.close();
            });
        }
    }
}

module.exports = {
    BoardManager
}