import Chromium from "@patches/chromium";
import Amdfriend from "@patches/amdfriend";
import AppPatch from "@patches/apppatch";
import Discord from "@patches/discord";
import Firefox from "@patches/firefox";
import FirefoxDev from "@patches/firefox-dev";

export default class App {
    path: string;
    name: string;
    appPatches: AppPatch[] = [];
    constructor(path: string) {
        this.path = path;
        this.name = path.split("/").pop()!.replace(/.app/g, '');

        this.appPatches = [
            new Chromium(path),
            new Amdfriend(path),
            new Discord(path),
            new Firefox(path),
            new FirefoxDev(path),
        ];
    }
    patch = async () => this.appPatches.forEach(patch => patch.supported() && patch.patch());
    supported = () => this.appPatches.some(patch => patch.supported());
    patched = () => {
        for(const pch of this.appPatches){
            if(pch.supported()) return pch.patched();
        }
        return -1;
    }
}
