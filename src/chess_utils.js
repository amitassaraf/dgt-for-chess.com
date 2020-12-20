const getFenWithoutAttributes = (fullFen) => {
    return fullFen.split(' ')[0]
}

const parseSan = (san) => {
    const {groups: {type, column, row, capture, captureSquare, promotion, checkOrMate, castle}} = /^(?<type>[NBRQK])?(?<column>[a-h])?(?<row>[1-8])?(?<capture>x)?(?<captureSquare>[a-h][1-8])?(?<promotion>=[NBRQK])?(?<checkOrMate>\+|#)?$|^(?<castle>O-O(-O)?)$/.exec(san);
    return {
        type: type ? type.toLowerCase() : type,
        fromOrTo: column || row ? `${column ? column : ''}${row ? row : ''}` : undefined,
        capture: capture === 'x',
        toIfCapture: captureSquare,
        promotion: promotion ? promotion.replace(/=/g, '').toLowerCase() : promotion,
        check: checkOrMate === '+',
        checkmate: checkOrMate === '#',
        castleKing: castle === 'O-O',
        castleQueen: castle === 'O-O-O'
    };
};

module.exports = {
    getFenWithoutAttributes,
    parseSan
}