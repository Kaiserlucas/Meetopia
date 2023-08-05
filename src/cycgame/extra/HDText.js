import * as PIXI from 'pixi.js';

function execute () {
    let _PIXI_Text_UpdateText = PIXI.Text.prototype.updateText;
    PIXI.Text.prototype.updateText = function (respectDirty) {
        if (this.dirty) {
            this.resolution = 2;
        }
        _PIXI_Text_UpdateText.apply(this, [respectDirty]);
    }
}

export default {
    execute,
}