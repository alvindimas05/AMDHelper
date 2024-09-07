import Chromium from "@patches/chromium";
import Amdfriend from "@patches/amdfriend";
import AppPatch from "@patches/apppatch";
import Discord from "@patches/discord";
import Firefox from "@patches/firefox";
import FirefoxDev from "@patches/firefox-dev";
import {PatchType} from "@src/types";

export default class App {
    path: string;
    name: string;
    appPatches: AppPatch[] = [];
    constructor(path: string) {
        this.path = path;
        this.name = path.split("/").pop()!.replace(/.app/g, '');

        global.electronApps = [];
        this.appPatches = [
            new Chromium(path),
            new Amdfriend(path),
            new Discord(path),
            new Firefox(path),
            new FirefoxDev(path),
        ];
    }
    async patch() {
        for(const app of this.appPatches){
            if(!app.supported()) continue;
            await app.patch()
        }
    }
    supported = () => this.appPatches.some(patch => patch.supported());
    patched = () => {
        for(const pch of this.appPatches){
            if(pch.supported()) return pch.patched();
        }
        return PatchType.UNDETECTED;
    }
}
