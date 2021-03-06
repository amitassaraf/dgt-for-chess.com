module.exports = {
    DEFAULT_CASTLING_RIGHTS: 'KQkq',
    DEFAULT_EN_PASSANT: '-',
    BOARD_WEBSOCKET: {
        HOSTNAME: '127.0.0.1',
        PORT: 9991,
    },
    LIVE_CHESS: {
        HOSTNAME: '127.0.0.1',
        PORT: 1982,
        BASE_URL: '/api/v1.0'
    },
    BOARD_STATUS: {
        CONNECTED: 'connected',
        CONNECTING: 'connecting',
        DISCONNECTED: 'disconnected',
    },
    WINDOW_WIDTH: 1200,
    WINDOW_HEIGHT: 800,
    DEFAULT_POSITION: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
    COLUMN_TO_LETTER: {
        1: 'a',
        2: 'b',
        3: 'c',
        4: 'd',
        5: 'e',
        6: 'f',
        7: 'g',
        8: 'h'
    },
    ROWS: 8,
    COLUMNS: 8,
    BLACK: 'b',
    WHITE: 'w',
    PAWN: 'p',
    QUEEN: 'q',
    PIECE_NOTATION_TO_NAME: {
        'q': 'Queen',
        'r': 'Rook',
        'p': 'Pawn',
        'b': 'Bishop',
        'n': 'Knight',
        'k': 'King',
    }
}