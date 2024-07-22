import Chromium from "./chromium";
import Amdfriend from "./amdfriend";
import AppPatch from "./apppatch";

export default class App {
    path: string;
    name: string;
    appPatches: AppPatch[] = [];
    constructor(path: string) {
        this.path = path;
        this.name = path.split("/").pop()!.replace(/.app/g, '');

        this.appPatches = [
            new Chromium(this.path),
            new Amdfriend(this.path),
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