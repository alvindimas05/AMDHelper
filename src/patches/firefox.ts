import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import fs from "fs";
import {PatchType} from "@src/types";

const firefoxPath = path.join(homedir(), "Library", "Application Support", "Firefox", "Profiles")
const patchCode = "user_pref(\"layers.acceleration.disabled\", true);"
export default class Firefox extends AppPatch {
    firefoxPath: string
    prefPath: string
    constructor(appName: string) {
        super(appName);

        this.firefoxPath = firefoxPath;
        this.setPrefPath(".default-release")
    }
    setPrefPath(dirname: string){
        if(this.pathExists(this.firefoxPath)){
            fs.readdirSync(this.firefoxPath).forEach(dir => {
                if(dir.endsWith(dirname)){
                    this.prefPath = path.join(this.firefoxPath, dir, "prefs.js");
                }
            });
        }
    }
    supported(): boolean {
        return this.appName === "Firefox";
    }
    patched() {
        let pref = fs.readFileSync(this.prefPath, "utf8");
        return pref.includes("user_pref(\"layers.acceleration.disabled\", true);") ? PatchType.PATCHED : PatchType.UNPATCHED;
    }
    async patch() {
        if(this.patched() === PatchType.PATCHED) return console.log(`${this.appName} already patched. Ignoring...`);
        let pref = fs.readFileSync(this.prefPath, "utf8");
        pref += "\n" + patchCode;
        fs.writeFileSync(this.prefPath, pref);
    }
}
