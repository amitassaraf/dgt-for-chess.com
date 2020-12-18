const WebSocket = require('ws');
const {LIVE_CHESS} = require('./src/constants');

let messageId = 1;

const listBoardsCall = () => JSON.stringify({"id": messageId++, "call": "eboards"});
const subscribeToBoard = (originalMessageId, serialNumber) => JSON.stringify({
    "id": messageId++,
    "call": "subscribe",
    "param": {"feed": "eboardevent", "id": originalMessageId, "param": {"serialnr": serialNumber}}
});

module.exports = {
    connect: function (onNewBoard) {
        const ws = new WebSocket(`ws://${LIVE_CHESS.HOSTNAME}:${LIVE_CHESS.PORT}${LIVE_CHESS.BASE_URL}`);

        ws.on('open', function open() {
            ws.send(listBoardsCall());
        });

        ws.on('message', async function incoming(data) {
            data = JSON.parse(data);
            if (data.response === 'call') {
                if (data.id === 1) { //First message is always list boards
                    if (!data.param || data.param.length === 0) {
                        // No boards connected!
                    } else {
                        ws.send(subscribeToBoard(1, data.param[0]['serialnr']));
                    }
                }
            } else if (data.response === 'feed') {
                await onNewBoard(data.param.board);
            } else {
                console.log(data);
            }
        });

        return ws;
    }
}

