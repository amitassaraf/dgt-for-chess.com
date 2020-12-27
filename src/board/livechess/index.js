const {LIVE_CHESS} = require('../../constants');
const WebSocket = require('ws');
const _ = require('lodash');
const {BaseBoardManager} = require("../base_board_manager");

let call = 10;

const listBoardsCall = () => JSON.stringify({"id": 1, "call": "eboards"});
const subscribeToBoard = (feedId, serialNumber) => JSON.stringify({
    "id": 2,
    "call": "subscribe",
    "param": {"feed": "eboardevent", "id": feedId, "param": {"serialnr": serialNumber}}
});
const getBoard = () => JSON.stringify({
        "id": call++,
        "call": "eboards",
        "param": {}
    }
);

class LiveChessBoardManager extends BaseBoardManager {
    constructor(boardCallback) {
        super(boardCallback);
        this.ws = undefined;
    }

    spawn = () => {
        this.ws = new WebSocket(`ws://${LIVE_CHESS.HOSTNAME}:${LIVE_CHESS.PORT}${LIVE_CHESS.BASE_URL}`);

        this.ws.on('open', () => {
            this.ws.send(listBoardsCall());
        });

        this.ws.on('message', async (data) => {
            data = JSON.parse(data);
            if (data.response === 'call') {
                if (data.id === 1) { //First message is always list boards
                    if (!data.param || data.param.length === 0) {
                        // No boards connected!
                    } else {
                        this.ws.send(subscribeToBoard(data.id, data.param[0]['serialnr']));
                        this.boardConnected = true;
                        console.log('Board connected.');
                    }
                } else {
                    if (!data.param || data.param.length === 0) {
                        // No boards connected!
                    } else {
                        this.batteryStatus = data.param[0].battery;
                        this.boardCallback && this.boardCallback(data.param[0].board);
                    }
                }
            } else if (data.response === 'feed') {
                this.batteryStatus = data.param.battery;
                this.boardCallback && this.boardCallback(data.param.board);
            }
        });
        console.log('Spawned process.');
    }

    _getBoard = async () => {
        if (this.ws) {
            this.ws.send(getBoard());
        }
    }
}

module.exports = {
    LiveChessBoardManager
}