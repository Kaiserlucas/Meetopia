import * as PIXI from 'pixi.js';

export function createRect(x = 0, y = 0, width = 10, height = 10, color = 0xff0000, alpha = 0.5) {
    var gfx = new PIXI.Graphics();
    gfx.beginFill(color, alpha);
    gfx.drawRect(0, 0, width, height);
    gfx.endFill();
    gfx.position.set(x, y);
    return gfx;
}

export function createCircle(x, y, r = 10, color = 0xff0000, alpha = 0.5) {
    var gfx = new PIXI.Graphics();
    gfx.beginFill(color, alpha);
    gfx.drawCircle(0, 0, r);
    gfx.endFill();
    gfx.position.set(x, y);
    return gfx;
}

/**
 * erstellt einen dragbaren pointer, hilft dabei eine position für verschiedene elemente zu finden
 */
export function createPositionPoint(x, y, r = 10, color = 0xff0000, alpha = 0.5) {
    var gfx = new PIXI.Graphics();
    gfx.beginFill(color, alpha);
    gfx.drawCircle(0, 0, r);
    gfx.endFill();
    gfx.position.set(x, y);
    var text = new PIXI.Text("");
    text.style.fontFamily = "monospace";
    text.style.fontSize = 16;
    text.style.dropShadow = true;
    text.style.dropShadowColor = 0xffffff;
    text.style.dropShadowAngle = 0.0;
    text.style.dropShadowBlur = 5;
    text.style.dropShadowDistance = 0;
    text.position.y = -r - 2;
    text.anchor.set(0.5, 1.0);
    text.interactive = false;
    gfx.cursor = "pointer";
    gfx.addChild(text);
    setInterval(() => {
        text.text = `x: ${Math.round(gfx.x)} y: ${Math.round(gfx.y)}`;
    }, 1/60);
    dragdrop(gfx);
    return gfx;
}

export function debugView(view) {
    if(!view.addChild && view.view){
        view = view.view;
    }    
    
    let lb = view.getLocalBounds();
    let scale = Math.min(view.worldTransform.a, view.worldTransform.d);
    
    var gfx = new PIXI.Graphics();
    gfx.beginFill(0xff0000);
    gfx.drawCircle(0, 0, 10);
    gfx.endFill();

    var text = new PIXI.Text("");
    text.style.fontFamily = "monospace";
    text.style.fontSize = 16;
    text.style.dropShadow = true;
    text.style.dropShadowColor = 0xffffff;
    text.style.dropShadowAngle = 0.0;
    text.style.dropShadowBlur = 5;
    text.style.dropShadowDistance = 0;
    text.position.y = lb.top * scale;
    text.anchor.set(0.5, 1.0);
    text.interactive = false;

    setInterval(() => {
        let newText = [];
        newText.push(`x: ${Math.round(view.x)} y: ${Math.round(view.y)}`);
        newText.push(`w: ${Math.round(view.width)} h: ${Math.round(view.height)}`);
        newText.push(`scale: ${Math.round(view.scale.x * 100)}%`);
        text.text = newText.join("\n");
        text.rotation = -view.rotation;
    }, 1 / 60);

    gfx.addChild(text);
    gfx.scale.set(1 / scale);
    view.addChild(gfx);
    dragdrop(view);
}

function dragdrop(view) {
    if (view) {
        view.interactive = true;
        var dragging = false;
        view.on("pointerdown", (e) => {
            dragging = true;
        });
        view.on("pointerup", (e) => {
            dragging = false;
            console.log("//pos:", view.position.x, view.position.y);
        });
        view.on("pointermove", (e) => {
            if (dragging) {
                var localPoint = view.parent.toLocal(e.data.global);
                view.position.x = localPoint.x;
                view.position.y = localPoint.y;

            }
        })
    }
}

export default {
    createRect,
    createCircle,
    debugView,
    createPositionPoint,
}