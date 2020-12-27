const _ = require('lodash');

class BaseBoardManager {
    constructor(boardCallback) {
        this.boardConnected = false;
        this.boardCallback = boardCallback;
        this.batteryStatus = undefined;
    }

    spawn = () => {
    }

    setPhysicalBoardCallback = (callback) => {
        this.boardCallback = callback;
    }

    _getBoard = async () => {

    }

    getBoard = _.throttle(async () => {
        if (this.boardConnected) {
            await this._getBoard();
        }
    }, 500, {'trailing': false});
}

module.exports = {
    BaseBoardManager
}