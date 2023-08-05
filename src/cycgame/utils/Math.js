import { Point } from "pixi.js";

export function normalizeVector(p){
    let len = Math.sqrt(p.x * p.x + p.y * p.y);
    if (len !== 0) {
        p.x *= (1 / len);
        p.y *= (1 / len);
    }

    return p;
}

export function getVectorLength(p){
    let len = Math.sqrt(p.x * p.x + p.y * p.y);
    return len;
}

export function multiplyVector(p, mult) {
    p.x *= mult;
    p.y *= mult;
    return p;
}

export function getDistanceVector(from, to){
    let dx = from.x - to.x;
    let dy = from.y - to.y;
    let p = new Point(dx, dy);
    return p;
}

export function getVectorDirection(p) {
    let angle = Math.atan2(p.y, p.x);

    return angle;
}

export function getXYDirection(x, y) {
    let angle = Math.atan2(y, x);

    return angle;
}

export function getDistanceP1P2(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;

    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist;
}

// https://gist.github.com/demonixis/4202528?permalink_comment_id=2077951#gistcomment-2077951
// angle = wrap(angle, 0, 360); // wrap between 0 & 360°
// angle = wrap(angle, -90, +90); // wrap between +/-90°
// index = wrap(index, 0, array.length);
export function wrap(value, min, max) {
    let valueRange = max - min;
    return (min + ((((value - min) % valueRange) + valueRange) % valueRange));
}