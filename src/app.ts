import Chromium from "./chromium.ts";

const chromiumBrowsers = ["Google Chrome", "Arc", "Microsoft Edge"];

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
        return chromiumBrowsers.includes(this.name);
    }
    patched(): boolean {
        return this.chromium != null && this.chromium.patched();
    }
}