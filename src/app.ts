import Chromium from "./chromium.ts";

const chromiumBrowsers = ["Google Chrome", "Arc", "Microsoft Edge"];
const amdfriends = ["Adobe Photoshop", "CorelDRAW"];

export default class App {
    name: string;
    chromium: Chromium | null = null;
    constructor(name: string) {
        this.name = name;
        this.checkChromium();
    }
    checkChromium(){
        this.chromium = new Chromium(this.name);
        if(this.chromium.supported()) return;
        this.chromium = null;
    }
    patch(){
        if(this.chromium != null){
            this.chromium.patch();
            return;
        }
    }
    supported(): boolean {
        return this.chromiumSupported() || this.amdfriendSupported();
    }
    chromiumSupported = () => chromiumBrowsers.includes(this.name);
    amdfriendSupported = () => amdfriends.some(v => v.includes(this.name));
    patched(): number {
        if(this.chromium != null && this.chromium.patched()){
            return 1;
        } else if(this.amdfriendSupported()){
            return 0;
        }
        return -1;
    }
}