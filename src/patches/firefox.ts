import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import fs from "fs";
import {PatchType} from "@src/types";

const patchCode = "user_pref(\"layers.acceleration.disabled\", true);"
export default class Firefox extends AppPatch {
    originalAppName = "Firefox"
    prefPathName = ".default-release"
    firefoxPath = path.join(homedir(), "Library", "Application Support", "Firefox", "Profiles")
    prefPath: string
    constructor(appName: string) {
        super(appName);
        this.setPrefPath();
    }
    setPrefPath(){
        if(this.supported() && fs.existsSync(this.firefoxPath)){
            fs.readdirSync(this.firefoxPath).forEach(dir => {
                if(dir.endsWith(this.prefPathName)){
                    this.prefPath = path.join(this.firefoxPath, dir, "prefs.js");
                }
            });
        }
    }
    supported(): boolean {
        return this.appName === this.originalAppName;
    }
    patched() {
        if(!fs.existsSync(this.firefoxPath)) return PatchType.UNPATCHED;
        let pref = fs.readFileSync(this.prefPath, "utf8");
        return pref.includes("user_pref(\"layers.acceleration.disabled\", true);") ? PatchType.PATCHED : PatchType.UNPATCHED;
    }
    async patch() {
        if(this.patched() === PatchType.PATCHED) return console.log(`${this.appName} already patched. Ignoring...`);
        if(fs.existsSync(this.firefoxPath)) return this.missingData();
        let pref = fs.readFileSync(this.prefPath, "utf8");
        pref += "\n" + patchCode;
        fs.writeFileSync(this.prefPath, pref);
    }
}
