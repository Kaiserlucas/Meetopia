export default class KeyManager{
    constructor(){
        this.keyMap = {};
        window.addEventListener("keydown", this.keydown.bind(this));
        window.addEventListener("keyup", this.keyup.bind(this));
    }

    keydown(e){
        let key = e.code;
        this.keyMap[key] = true;
        console.log("//KeyPressed:", e.code);
    }

    keyup(e) {
        let key = e.code;
        this.keyMap[key] = false;
    }

    isDown(key) {
        let result = false;
        if(this.keyMap[key]){
            result = this.keyMap[key];
        }
        return result;
    }

    isUp(key) {
        return !this.isUp(key);
    }
}