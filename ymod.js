// ==UserScript==
// @name         &y mod
// @namespace    -
// @version      1.0
// @description  -
// @author       Zombs#8962 & 𝔊𝔬𝔨𝔲𝔪22#9752
// @match        *://sploop.io/*
// @icon         https://www.google.com/s2/favicons?domain=sploop.io
// @run-at       document-start
// @require      https://cdn.discordapp.com/attachments/952279316933259354/965004865174642729/message.txt
// @grant        none
// ==/UserScript==

window.settings = {
    kill_chat: true
};

const msgs = [
    'noob'
];

const ws = new WebSocket('wss://night-boulder-playground.glitch.me/');
ws.addEventListener('open', e => {
    setInterval(() => {
        ws.readyState === 1 && ws.send('hi');
    }, 5000);
    ws.addEventListener('message', e => {
        try {
            const data = e.data;
            const t = JSON.parse(data);
            if (!ok(t.server)) return;

            switch (t.action) {
                case 'message':
                    sploop.message(t.msg);
                    break;
                case 'musket':
                    if (getSecondary() == 4 && !inTrap) {
                        let angle = angleFromId(t.target);
                        if (angle !== null) {
                            sploop.kr(4);
                            aim(angle);
                            hit(angle);
                        }
                    }
                    break;
                case 'invis':
                    if (!inTrap) {
                        let angle = angleFromId(t.target);
                        equip(2);
                        select(getPrimary());
                        aim(angle);
                        hit(angle);
                        sploop.kr(15);
                    }
                    break;
                case 'move':
                    if (movementsync) {
                        sploop.move(t.value);
                    }
            }
        } catch (error) {
            console.error(error)
        };
    });
});

const ok = s => sploop && sploop.player && s == sploop.ov.ox && enabled;
const send = (a, d) => ws.readyState === 1 && (d.action = a, d.server = sploop.ov.ox, ws.send(JSON.stringify(d)));
/*
const target = function() {
    return { target: nearestEnemy[id], action: null, server: null };
}
*/

function test(msg) {
    send('message', {
        msg: '' + msg
    });
}

function move(t) {
    send('move', {
        value: t
    });
}

function musket() {
    send('musket', { target: nearestEnemy[id] });
}

function invis() {
    send('invis', { target: nearestEnemy[id] });
}

let canvas = null;
let sploop = null;
Object.defineProperty(Object.prototype, 'canvas', {
    get() {
        if (!sploop) (sploop = this, init());
        return canvas ? canvas : void 0;
    },
    set(value) {
        canvas = value;
    }
});

// mL movement
const [
    eObj,
    entities,
    etypes,
    alive,
    type,
    x,
    y,
    x2, // Use x2 and y2 to draw on canvas
    y2,
    hp,
    id,
    ctx,
    keyDown,
    keyUp,
    IObj,
    Items,
    Hat,
    Item,
    equipHat,
    pid,
    tid,
    dir,
    chooseItem,
    startHit,
    stopHit,
    chatMessage,
    createTeam,
    selectItem,
    mouseX,
    mouseY,
    autoHit
] = [
    'm1', // eObj
    'ij', // entities
    'ik', // etypes
    'mB', // alive
    'type', // type
    'ix', // x
    'iv', // y
    'iy', // x2
    'iw', // y2 SWAP
    'iq', // hp
    'aL', // id
    'lA', // ctx
    'kd', // keydown
    'ku', // keyup
    'ks', // iobj
    'kt', // items
    'io', // hat
    'im', // item
    'nr', // Equip Hat
    'iE', // pid
    'ip', // tid
    'is', // dir
    'oJ', // Choose Item
    'ku', // start hit
    'kx', // stop hit
    'oK', // Send Message
    'nW', // Create Team
    'kr', // Select Item
    'os', // mouseX
    'ot', // mouseY
    'kn' // AutoHit
];
const say = chatMessage;

let zoom = 1;

const naginata = [28, 44, 45];
const spikes = [2, 7, 17];
const hats = {
    '0': 'No Hat',
    '1': 'Bush Gear',
    '2': 'Berserker Gear',
    '3': 'Jungle Gear',
    '4': 'Crystal Gear',
    '5': 'Spike Gear',
    '6': 'Immunity Gear',
    '7': 'Boost Hat',
    '8': 'Apple Hat',
    '9': 'Scuba Gear',
    '10': 'Hood',
    '11': 'Removed'
};

let lastHeal = 0;
let ticks = 0;

let tx, hue = 0, ping = 50;
let autoreplaceQueue = 0, lastAutoreplace = 0;

let autochat = false,
    autoaim = false,
    autobreak = true,
    spin = false,
    autorespawn = false,
    autohats = false,
    autoreplace = true,
    autochoose = false,
    chatSync = false,
    autoplace = false,
    enabled = true,
    movementsync = false;

let normalHat = 0;
let allowAiming = true;
let oldWeapon = 0, oldAngle = 0;

let primary, secondary, foodType, spikeType, trapType, millType, wallType, roofType, bedType;

let team = {};

function team_has(player_id) {
    return team[player_id] !== undefined;
}
function team_add(id, player_id) {
    team[player_id] = id;
}
function team_remove(player_id) {
    delete team[player_id];
}

let trap, trapId, inTrap = false;
let nearestEnemy, nearestEnemyAngle, nearestEnemyDist, enemyTrap, enemyIsTrapped;

function hit(angle = Math.atan2(sploop[mouseY] - sploop.height / 2, sploop[mouseX] - sploop.width / 2)) {
    sploop[startHit](angle);
    sploop[stopHit]();
}

toRad = t => t * Math.PI / 180;
function _place(id, angle = Math.atan2(sploop[mouseY] - sploop.height / 2, sploop[mouseX] - sploop.width / 2)) {
    sploop[selectItem](id);
    hit(angle);
    // sendKey('' + weapon);
    sploop[selectItem](weapon-1 ? sploop.items[1] : sploop.items[0]);
}

const dist = e => {
    let player = sploop.player;
    return Math.hypot(e[x2] - player[x2], e[y2] - player[y2]);
};

const ang = e => {
    let player = sploop.myPlayer;
    return Math.atan2(
        -(e.y - player.y2),
        e.x - player.x2
    ) + Math.PI / 2;
}

function unload(entity) {
    let player = sploop.myPlayer;
    if (Math.hypot(entity.x - player.x2, entity.y - player.y2) <= 150
        && entity.type != 0 && !isProjectile(entity.type)) {
        // sploop[chatMessage]('replace ' + entity.id + ' type:' + entity.type);
        let angle = ang(entity);
        function PLACE() {
            let st = getSpikeType();
            let tt = getTrapType();

            _place(!spikes.includes(entity.type) || tt == getPrimary() ? st : getTrapType(), angle);
        };

        let t = performance.now() - lastAutoreplace;
        if (t >= 100) {
            PLACE();
            lastAutoreplace = performance.now();
        } else {
            autoreplaceQueue++;
            setTimeout(function() {
                PLACE();
                autoreplaceQueue--;
                lastAutoreplace = performance.now();
                aim(sploop.myPlayer.angle)
            }, autoreplaceQueue * 100 - t);
        }
        aim(player.angle);
    }
}

function enemyangle() {
    let player = sploop.myPlayer;
    return nearestEnemy ? Math.atan2(
        -(nearestEnemy[y2] - player.y2),
        nearestEnemy[x2] - player.x2
    ) + Math.PI / 2 : 0;
}

function angleFromId(id) {
    let e = sploop[eObj][entities][id];
    let player = sploop.myPlayer;
    if (!e) return null;
    return Math.atan2(
        -(e[y2] - player.y2),
        e[x2] - player.x2
    ) + Math.PI / 2;
}

function canInsta() {
    return naginata.includes(getPrimary());
}

function eaim() {
    // p0
    let e = enemyangle();
    sploop.oN({
        isTrusted: true,
        clientX: sploop.width / 2 + 15 * Math.cos(e),
        clientY: sploop.height / 2 + 15 * Math.sin(e)
    });
}

function sea() {
    const player = sploop.myPlayer;
    return player.y >= 160 && player.x >= 8000 && player.y <= 9840 && player.x <= 9000
}

function aim(angle) {
    sploop.oN({
        isTrusted: true,
        allowed: true,
        clientX: sploop.width / 2 + 15 * Math.cos(angle),
        clientY: sploop.height / 2 + 15 * Math.sin(angle)
    });
}

function turn(e) {
    aim(sploop.myPlayer.angle + e);
}

function isProjectile(type) {
    return 12 === type;
}

autoChoose = () => [1, 12, 9, 19, 20, 26, 8, 17, 27, 16].forEach(i => sploop[chooseItem](i));
// autoChoose = () => [1, 12, 9, 19, 20, 15, 8, 17, 16].forEach(i => sploop[chooseItem](i));

let antiTrapInterval = null;
function AntiTrap() {
    if (!sploop[alive] || !trap) return;

    let player = sploop.myPlayer;
    let angle = Math.atan2(
        trap[y] - player.y2,
        trap[x] - player.x2
    ) + Math.PI / 2;

    let type1 = getSpikeType();
    let type2 = getTrapType() == getPrimary() ? type1 : getTrapType();

    autohats && equip(6);

    _place(type2, -angle);
    setTimeout(() => { _place(type1, -angle + toRad(75)) }, 100);
    setTimeout(() => { _place(type1, -angle - toRad(75)) }, 230);
}

function heal(ms) {
    setTimeout(() => {
        lastHeal = performance.now();

        let health = sploop.myPlayer.health;
        let j;
        while(health < 100) (j = getFoodType(), health += j == 10 ? 20 : 35, _place(j));
    }, ms);
}

i = e => nearestEnemyDist <= e;
const it = 1e3/9;
let healed = false;

function tick() {
    healed = false;
    // next tick at performance.now() + it
    const player = sploop.myPlayer;
    let nt = it - ping;
    if (player.health < 100 && !sploop.healDisabled) heal(80-ping);

    if (autoplace && !inTrap) {
        if (nearestEnemyDist <= 100 && !enemyIsTrapped) {
            _place(getTrapType(), enemyangle());
        } else if (enemyIsTrapped) {
            _place(getSpikeType(), enemyangle());
        }
    } 

/*
    if (sea()) {
        _place(getRoofType(), player.angle);
    }
*/
}

function init() {
    window.game = sploop;

    sploop.o3 = () => {
        sploop.scale = Math.max(sploop.height / (1026*zoom), sploop.width / (1824*zoom));
    }

    sploop.zoom = r => {
        zoom += r;
        if (zoom <= 0) zoom -= r;
        sploop.resize();
    }

    sploop.setZoom = r => {
        zoom = r;
        sploop.resize();
    }

    sploop._kx = sploop.kx; sploop.kx = function noob() {
        this[alive] && this.player && this._kx();
    }.bind(sploop);

    let hi = sploop.nI;
/*
    const small = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    sploop.nI = function(t) {
    	t[1] = t[1].toString().replace(/./g, t=>small[t]);
    	hi.call(this, t);
    }
*/

    sploop._od = sploop.od;
    sploop.od = function(t) {
        ping = t[1] | t[2] << 8;
        sploop._od(t);
    }
    sploop._oN = sploop.oN;
    sploop.oN = t => (allowAiming || t.allowed) && sploop._oN(t);

    sploop.healDisabled = false;

    Object.defineProperty(sploop, 'player', { get() { return sploop[eObj][entities][sploop.player_id] } });
    Object.defineProperty(sploop, 'players', { get() { return sploop[eObj][etypes][0] } });
    Object.defineProperty(sploop, 'items', { get() { return sploop[IObj][Items] } });
    Object.defineProperty(sploop, 'myPlayer', {
        get() {
            let t = sploop.player;
            if (!t) return {type: 0, id: -1, x: 0, y: 0, x2: 0, y2: 0, health: 101, hat: -1, item: -1, player_id: -1, team_id: -1, dir: 0};
            return {
                type: t[type],
                id: t[id],
                x: Math.trunc( t[x] ), // x is y \:
                y: Math.trunc( t[y] ), // y is x (oops)
                x2: t[x2],
                y2: t[y2],
                health: Math.trunc( 100 * t[hp] / 255 ),
                hat: t[Hat],
                item: t[Item],
                player_id: t[pid],
                team_id: t[tid],
                angle: t[dir]
            }
        }
    });

    function isEnemy(player) {
        let team = sploop.player[tid] ? sploop.mE.mc[sploop.player[tid]] : null;
        return !(team && sploop.player[tid] === player[tid] || player[id] === sploop.player_id);
    }

    function isEntityEnemy(entity) {
        let player = sploop.myPlayer;
        return !( team_has(entity[pid]) || (!player.team_id && entity[pid] === player.player_id) );
    }
    game.isEntityEnemy = isEntityEnemy;

    let _;
    document.title = 'Sploop.io - &ymod';
    document.getElementById('play').addEventListener('click', e => {
        weapon = 1;
        clearInterval(antiTrapInterval);
        // sploop[createTeam]('&ymod');
        if (_) return;

        window.console = document.body.appendChild(document.createElement('iframe')).contentWindow.console;

        sploop.message = sploop[chatMessage];
        sploop[chatMessage] = function(t) {
            if (chatSync) {
                send('message', { msg: t });
            } else {
                this.message(t);
            }
        };

        sploop.move = sploop.mL;
        sploop.mL = function(t) {
            if (movementsync) {
                move(t);
            } else {
                sploop.move(t);
            }
        }

        const _iK = sploop.m1.iK;
        sploop.m1.iK = function(t, i) {
            if (this.ij[t] && autoreplace && enabled) {
                let h = this.ij[t];
                unload({
                    x: h[x],
                    y: h[y],
                    id: t,
                    type: h[type]
                });
            }
            _iK.call(sploop.m1, ...arguments);
        }.bind(sploop.m1);

        sploop.onKill = sploop.nn;
        sploop.nn = function(t) {
            if (settings.kill_chat && t[1][0] && enabled) sploop[say](t[1][0]);
            this.onKill(t);
        }

        sploop.func = sploop['o9'];
        sploop['o9'] = function(t) {
            ticks++;
            enabled && tick();
            this.func(t);
        }

        // game.oR[0].eF = '#2ce679';
        keydown = sploop.mA.kc;
        keyup = sploop.mA.kw;
        document.getElementById('grid-toggle').click();
        sploop.n7.jI.grid = ['___', '___']; // H
        sploop.n7.jI.jK = ['___', '___']; //
        sploop.n7.jI.h = ['___', '___']; //
        sploop.n7.jI.jJ = ['___', '___']; // F
        sploop.n7.jI.spike = ['___', '___']; // ShiftLeft

        sploop.items = sploop[IObj][Items];

        sploop.ks.lf.kV = () => {};
        Object.defineProperty(sploop.ks, 'lc', {
            get() { return [] },
            set(value) {}
        });

        requestAnimationFrame(_ = () => {
            if (!tx) tx = sploop[ctx];
            if (sploop[alive] && sploop.player && enabled) {
                let color = `hsl(${hue}, 100%, 50%)`;
                hue += .3;

                let player = sploop.myPlayer;
                if ((player.health <= 15 || [49, 35, 47, 39, 34].includes(player.health)) && !healed) (heal(0), healed = true, sploop.oK('e'));

/*
                if (player.health < 100 && !sploop.healDisabled) {
                    if (player.health > 40) {
                        heal(ping*1.15);
                    } else {
                        autohats && equip(6);
                        let j, health = player.health;
                        while(health < 100) (j = getFoodType(), health += j == 10 ? 20 : 35, _place(j));

                        lastHeal = performance.now();
                    }
                }
*/

                // nearest enemy
                const players = [...sploop[eObj][etypes][0]];
                players.sort((f, g) => {
                    return Math.hypot(
                        f[x2] - player.x2,
                        f[y2] - player.y2
                    ) - Math.hypot(
                        g[x2] - player.x2,
                        g[y2] - player.y2
                    );
                });

                if (!player.team_id) team = {};

                for (let i = 0; i < players.length; i++) {
                    const t = players[i];
                    const ID = t[id];
                    const PLAYER_ID = t[pid];

                    if (player.team_id && t[tid] === player.team_id) {
                        team_add(ID, PLAYER_ID);
                    } else { team_remove(PLAYER_ID) };

                    if (isEnemy(t)) {
                        nearestEnemy = t;
                        nearestEnemyAngle = Math.atan2(
                            t[y2] - player.y2,
                            t[x2] - player.x2
                        );
                        nearestEnemyDist = Math.hypot(
                            player.x2 - t[x],
                            player.y2 - t[y]
                        );
                        break;
                    }
                }

                const traps = sploop[eObj][etypes][6];
                trap = null;
                enemyTrap = null;
                if (autobreak) {
                    for (let i = 0; i < traps.length; i++) {
                        const _trap = traps[i];
                        if (_trap && nearestEnemy && isEntityEnemy(_trap) && Math.hypot(_trap[x] - player.x, _trap[y] - player.y) <= 55) {
                            trap = _trap;
                            let angle = Math.atan2(
                                trap[y] - player.y2,
                                trap[x] - player.x2
                            ) + Math.PI / 2;

                            if (!inTrap) {
                                inTrap = true;

                                oldWeapon = [player.item, weapon];
                                oldAngle = player.angle;
                                allowAiming = false;
                                AntiTrap();
                                antiTrapInterval = setInterval(AntiTrap, 600);
                                autoChoose();
                            } else {
                                let e = Math.atan2(
                                    -(trap[y] - player.y2),
                                    trap[x] - player.x2
                                ) + Math.PI / 2;

                                hit(e);
                                sploop[autoHit](true);

                                if (sploop.items[1] == 15) { sploop[selectItem](15) ; weapon = 2 } else {
                                    select(getPrimary());
                                    weapon = 1;
                                }

                                aim(e);
                            }

                            trapId = trap[id];
                            break;
                        } else if (isEntityEnemy(_trap)) {
                            if (_trap && nearestEnemy && Math.hypot(_trap[x] - nearestEnemy[x], _trap[y] - nearestEnemy[y]) <= 55) {
                                    enemyIsTrapped = true;
                                    enemyTrap = _trap;
                                    sploop.et = enemyTrap;
                            }
                        }
                    }
                }

                if (!trap && inTrap) {
                    allowAiming = true;
                    sploop[autoHit](false);
                    clearInterval(antiTrapInterval);

                    let wasSpinEnabled = spin;
                    spin = true;
                    setTimeout(() => {
                        if (!inTrap) {
                            let t = naginata.includes(getPrimary());
                            sploop[selectItem](t ? getSecondary() : oldWeapon[0]);
                            weapon = t ? 2 : oldWeapon[1];
                        }
                        spin = wasSpinEnabled;
                        aim(oldAngle);
                    }, it);

                    trapId = null;
                    inTrap = false;
                    autohats && equip(normalHat);
                    _place(getSpikeType(), enemyangle());
                }

                if (!enemyTrap && enemyIsTrapped) {
                    enemyIsTrapped = false;
                    if (canInsta() && nearestEnemyDist < 200) { insta() }
                    else if (nearestEnemyDist < 150) {_place(getTrapType(), enemyangle()) };
                }

                if (autoaim && !inTrap && (player.item == 27 || nearestEnemyDist < 300)) {
                    let e = Math.atan2(
                        -(nearestEnemy[y2] - player.y2),
                        nearestEnemy[x2] - player.x2
                    ) + Math.PI / 2;

                    hit(e);
                    aim(e);
                }
                if (spin && !inTrap) aim(Math.floor(Math.random() * 360) * Math.PI / 180);

                tx.save();

                tx.scale(1/sploop.scale, 1/sploop.scale);
                tx.fillStyle = color;
                tx.font = '50px Baloo Paaji';
                tx.textAllign = 'right';
                tx.fillText(
                    ping + ' ' +
                    autoreplace + ' ' +
                    hats[player.hat],
                    5, sploop.height - 55
                );

                tx.restore();
            }

            sploop.team = team;
            requestAnimationFrame(_);
        });

        setInterval(() => {
            // sploop[alive] && [1, 12, 9, 19, 20, 15, 49, 17, 16].forEach(i => sploop[chooseItem](i));
            if (sploop[alive] && sploop.player && !inTrap && autohats && enabled) {
                let player = game.myPlayer;

                normalHat = (nearestEnemy && nearestEnemyDist < 270) ? 6 : 7;
                if (naginata.includes(getPrimary())) normalHat = 7;
                autoaim && (normalHat = sploop.player[Hat]);
                if (sea()) normalHat = 9;
                equip(normalHat);
            };

            if (sploop[IObj].ld.length > 0 && autochoose) autoChoose();
        }, 100);

        let index = 0;
        setInterval(() => {
            if (autochat) {
                sploop[chatMessage](msgs[index]);
                index++;
                index == msgs.length && (index = 0);
            }
        }, 2000);
    });
}

let repeater = function(e, o, t) {
    let n = !1,
    a = void 0;
    return {
        start(d) {
            d == e && (n = !0, void 0 === a && (a = setInterval(() => {
                o(), o(), n || (clearInterval(a), a = void 0)
            }, t)))
        },
        stop(o) {
            o == e && (n = !1)
        }
    }
};

let keydown, keyup, weapon = 1;
const _primary = [0, 1, 2, 3, 13, 17, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 45];
const _secondary = [4, 11, 15, 26, 27, 50];

const food = 'KeyQ';
const spike = 'KeyR';
const ptrap = 'KeyF';


function getMillType(){return sploop.items.length>6?sploop.items[5]:sploop.items[4]};
function getFoodType(){return sploop.items[(sploop.items.length>6)+1]};
function getSpikeType(){return sploop.items[(sploop.items.length>6)+3]};
// function getTrapType() {return sploop.items.length>5?sploop.items.length>6?sploop.items[6]:sploop.items[5]:sploop.items[0]};
function getTrapType() {
    let i = sploop.items;
    let j = i.indexOf(9);
    return i[j+1?j:6];
};
function getPrimary(){return sploop.items[0]};
function getSecondary(){return sploop.items[(sploop.items.length>6)|0]};
function getRoofType(){return sploop.items.length>7?sploop.items[7]:sploop.items[0]};

function sendCode(code) {
    let o = {code};

    if (keydown) keydown.call(sploop.mA, o);
    if (keyup) keyup.call(sploop.mA, o);
}

function sendKey(key) {
    let o = {key};

    if (keydown) keydown.call(sploop.mA, o);
    if (keyup) keyup.call(sploop.mA, o);
}

function place(t) {
    sendCode(t);
    sendCode('Space');
    sendKey('' + weapon);
}

function equip(id) {
    if (sploop.player[Hat] != id) sploop[equipHat](id);
}

function unequip(id) {
    if (sploop.player[Hat] == id) sploop[equipHat](id);
}

function select(id) {
    if (sploop.player[Item] != id) sploop[selectItem](id);
}

function insta() {
    if (inTrap) return;

    let player = sploop.myPlayer;
    let t = enemyangle();
    oldAngle = player.angle;

    function g() {
        equip(2);
        select(getPrimary());
        hit(t);
    }

    function j() {
        if (!autohats) setTimeout(() => {
            if (!autohats) unequip(2);
        }, 1e3);
    }

    if (naginata.includes(getPrimary()) && ![6, 4].includes(nearestEnemy[Hat])) {
        g();
        _place(getSpikeType(), t);
        eaim();
        setTimeout(() => { select(getSecondary()); aim(oldAngle) }, 150);
        j();
    } else {
        g();
        _place(getSpikeType(), t - toRad(36));
        setTimeout(() => { _place(getSpikeType(), t + toRad(36)); aim(oldAngle) }, 100);
        j();
    }
}

const key = {
    'KeyM': () => sploop[equipHat](7),
    'KeyJ': () => sploop[equipHat](2),
    'KeyZ': () => sploop[equipHat](5),
    'KeyC': () => sploop[equipHat](6),
    'KeyB': () => { for (let i = 0; i < 12; i++) sploop[equipHat](i) },
    'KeyP': () => autochat = !autochat,
    'KeyO': autoChoose,
    'KeyL': () => autoaim = !autoaim,
    'KeyI': () => autobreak = !autobreak,
    'KeyG': () => (_place(getSpikeType(), enemyangle()), aim(sploop.myPlayer.angle)),
    'KeyH': () => (_place(getTrapType(), enemyangle()), aim(sploop.myPlayer.angle)),
    'KeyR': () => spin = !spin,
    'KeyU': () => autohats = !autohats,
    'Semicolon': () => autoreplace = !autoreplace,
    'KeyQ': musket,
    'KeyT': insta,
    'Insert': () => sploop[say](JSON.stringify(sploop[IObj].kZ)),
    'Delete': () => chatSync = !chatSync,
    'ShiftRight': () => (movementsync = !movementsync, sploop.oK(movementsync ? 'On' : 'Off')), /*autoplace = !autoplace*/
    'KeyK': invis
};

const repeaters = [
    repeater(70, () => !inTrap && _place(getTrapType()), 0),  // F Traps
    repeater(86, () => !inTrap && _place(getSpikeType()), 0), // V Spikes
    repeater(78, () => !inTrap && _place(getMillType()), 0),  // N Mills
    repeater(89, () => !inTrap && _place(getRoofType()), 0)   // Y Roof
];

function j() {
    return sploop.chat.offsetParent === null && sploop.clan_menu_content.offsetParent === null;
}

addEventListener('keydown', e => {
    if (sploop[alive] &&
        sploop.player &&
        j())
    {
        if (enabled) {
            repeaters.forEach(r => r.start(e.keyCode));
            if (key[e.code]) key[e.code]();
        }
        if (e.key == '1') {weapon = 1; return};
        if (e.key == '2' && _secondary.includes(sploop.items[1])) {weapon = 2; return};

        if (e.code === 'ShiftLeft') {
            enabled = !enabled;
            if (!enabled) clearInterval(antiTrapInterval);
        }
    }
});
addEventListener('keyup', e => repeaters.forEach(r => r.stop(e.keyCode)));

addEventListener('wheel', e => {
    if (sploop && j())
    {
        if (e.deltaY < 0) {
            sploop.zoom(-0.25);
        } else {
            sploop.zoom(0.25);
        }
    }
});

/*
addEventListener('click', e => {
    if (e.isTrusted && sploop && j()) {
        invis();
    }
});
*/
