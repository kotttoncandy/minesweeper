import kaboom from "kaboom";

kaboom({
    width: 600,
    height: 600,
    background: "#48fcfe",
    debug: true
});


const NUM_BOMBS = 8

var bombArray = []
var mode = 1
function addBombs() {
    var x = Math.floor(Math.random() * 8)
    var y = Math.floor(Math.random() * 8)

    var index = (x * 8) + y; // Indexes

    if (bombArray.includes(index, 0)) {
        addBombs();
    } else {
        bombArray.push(index)
        var tile = get("tile")[index]
        //tile.color = RED
        tile.use("bomb")
    }
}

function checkBombs(index, x, y) {
    var spaces = [
        index - 9,
        index - 8,
        index - 7,

        index - 1,
        index + 1,

        index + 7,
        index + 8,
        index + 9,

    ]

    var intersections = 0

    for (var space = 0; space < spaces.length; space++) {
        if (space < 3) {
            if (Math.floor(spaces[space] / 8) == x - 1) {
                if (bombArray.includes(spaces[space])) {
                    intersections++;
                }
            }
        } else if (space >= 3 && space < 5) {
            if (Math.floor(spaces[space] / 8) == x) {
                if (bombArray.includes(spaces[space])) {
                    intersections++;
                }
            }
        } else if (space >= 5) {
            if (Math.floor(spaces[space] / 8) == x + 1) {
                if (bombArray.includes(spaces[space])) {
                    intersections++;
                }
            }
        }
    }


    return intersections;
}

var lose = add([
    text("YOU LOST", {
        size: 100
    }),
    color(RED),
    anchor("center"),
    pos(center()),
    z(10000),
])
lose.hidden = true;

for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {

        add([
            rect(50, 50),
            pos(x * 58 + 90, y * 60 + 90),
            outline(5),
            anchor("center"),
            color(WHITE),
            area({
                shape: new Rect(vec2(0, 0), 50, 50)
            }),
            "tile",
            { num: 0, index: 0, x: x, y: y }
        ])
    }
}

for (let bomb = 0; bomb < NUM_BOMBS; bomb++) {
    addBombs();
}

for (let tile = 0; tile < 64; tile++) {
    var num = checkBombs(tile, get("tile")[tile].x, get("tile")[tile].x);
    get("tile")[tile].num = num;
    get("tile")[tile].index = tile;

}


var tilesToClear = [];
var tilesToCheck = [];
var removedTiles = [];

function findTiles(index) {

    var tiles = get("tile")
    var a = tiles[index];


    var spaces = [
        index - 9,
        index - 8,
        index - 7,

        index - 1,
        index + 1,

        index + 7,
        index + 8,
        index + 9,

    ]
    tilesToClear.push(index);

    function chain() {
        if (!tiles[spaces[space]].is("bomb") && tiles[index].num == 0 && !removedTiles.includes(spaces[space]) && !tilesToClear.includes(spaces[space])) {
            
            tilesToClear.push(spaces[space]);

            if (tiles[spaces[space]].num == 0) {
                tilesToCheck.push(spaces[space]);
            }
        }

    }

    for (var space = 0; space < spaces.length; space++) {
        if (!bombArray.includes(spaces[space], 1) && spaces[space] < 64 && spaces[space] > 0) {
            if (space < 3) {
                if (Math.floor(spaces[space] / 8) == a.x - 1) {
                    chain();
                }
            } else if (space >= 3 && space < 5) {
                if (Math.floor(spaces[space] / 8) == a.x) {
                    chain();

                }
            } else if (space >= 5) {
                if (Math.floor(spaces[space] / 8) == a.x + 1) {
                    chain();

                }
            }
        }
    }
}



function clearTile(index) {
    var a = get("tile")[index]
    add([
        text(a.num),
        pos(a.pos),
        anchor("center"),
        "wasd"
    ])


    a.hidden = true;

}


onUpdate(() => {
    for (let i = 0; i < tilesToClear.length; i++) {
        clearTile(tilesToClear[i]);
        removedTiles.push(tilesToClear[i])
        tilesToClear.splice(i, 1);

    }

    for (let x = 0; x < tilesToCheck.length; x++) {
        findTiles(tilesToCheck[x]);
        tilesToCheck.splice(x, 1);
    }

    console.log(tilesToClear.length)

});

onClick("tile", (a) => {

    if (mode == 1 && a.color != RED) {
        if (a.is("bomb")) {
            lose.hidden = false;

            for (var i = 0; i < get("bomb").length; i++) {
                get("bomb")[i].color = BLUE;
            }

        } else {
            findTiles(a.index);
            
        }

        console.log(tilesToClear.length)
    }

    if (mode == 2) {
        a.color = a.color == RED ? WHITE : RED;
    }


})

onKeyDown("1", () => {
    mode = 1
})

onKeyDown("2", () => {
    mode = 2
})