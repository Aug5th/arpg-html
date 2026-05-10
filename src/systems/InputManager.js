export class InputManager {
    constructor() {
        this.keys = { w:false, a:false, s:false, d:false, ' ':false, 1:false, 2:false, 3:false, c:false, b:false, e:false };
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.isLmbDown = false;
        this.isRmbDown = false;

        this.onEscape = null;
        this.onKeyDownAction = null;

        window.addEventListener('mousemove', e => { this.mouseX = e.clientX; this.mouseY = e.clientY; });
        window.addEventListener('mousedown', e => { if(e.button === 0) this.isLmbDown = true; if(e.button === 2) this.isRmbDown = true; });
        window.addEventListener('mouseup', e => { if(e.button === 0) this.isLmbDown = false; if(e.button === 2) this.isRmbDown = false; });
        window.addEventListener('contextmenu', e => e.preventDefault());

        window.addEventListener('keydown', e => {
            const k = e.key.toLowerCase();
            if (k === 'escape' && this.onEscape) { this.onEscape(); return; }
            if (this.keys.hasOwnProperty(k)) {
                if (!this.keys[k] && this.onKeyDownAction) this.onKeyDownAction(k);
                this.keys[k] = true;
            }
        });
        window.addEventListener('keyup', e => {
            const k = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(k)) this.keys[k] = false;
        });
    }
}