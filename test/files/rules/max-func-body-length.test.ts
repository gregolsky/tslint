
function hasBodyLengthOf3 () {
    var x = 0;
    var y = parseInt(arguments[0]);

    return Math.random() + x - y;
}

function hasBodyLengthOf10 (x, y, z) {
    let result = 'a';
    for (let i = 0; i < 10; i++) {
        result += 'b';
    }

    try {
        x = 2 / 0;
    } catch (err) {
        return 'magic';
    }

    return [ 0, 0, 1, 2, 3, 5, 8 ]
        .map(x => x * 2)
        .filter(x => x % 3 === 0);
}
