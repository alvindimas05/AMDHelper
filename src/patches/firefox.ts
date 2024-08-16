import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import fs from "fs";

const firefoxPath = path.join(homedir(), "Library", "Application Support", "Firefox", "Profiles")
const patchCode = "user_pref(\"layers.acceleration.disabled\", true);"
export default class Firefox extends AppPatch {
    prefPath: string
    constructor(appName: string) {
        super(appName);
        fs.readdirSync(firefoxPath).forEach(dir => {
            if(dir.endsWith(".default-release")){
                this.prefPath = path.join(firefoxPath, dir, "prefs.js");
            }
        });
    }
    supported(): boolean {
        return this.appName === "Firefox";
    }
    patched() {
        let pref = fs.readFileSync(this.prefPath, "utf8");
        return pref.includes("user_pref(\"layers.acceleration.disabled\", true);") ? 1 : 0;
    }
    patch() {
        if(this.patched() === 1) return console.log(`${this.appName} already patched. Ignoring...`);
        let pref = fs.readFileSync(this.prefPath, "utf8");
        pref += "\n" + patchCode;
        fs.writeFileSync(this.prefPath, pref);
    }
}
