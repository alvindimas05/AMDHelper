import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import fs from "fs";

const firefoxPath = path.join(homedir(), "Library", "Application Support", "Firefox", "Profiles")
const patchCode = "user_pref(\"layers.acceleration.disabled\", true);"
export default class FirefoxDev extends AppPatch {
    prefPath: string
    constructor(appName: string) {
        super(appName);
        if(this.pathExists(firefoxPath)){
            fs.readdirSync(firefoxPath).forEach(dir => {
                if(dir.endsWith(".dev-edition-default")){
                    this.prefPath = path.join(firefoxPath, dir, "prefs.js");
                }
            });
        }
    }
    supported(): boolean {
        return this.appName === "Firefox Developer Edition";
    }
    patched() {
        let pref = fs.readFileSync(this.prefPath, "utf8");
        return pref.includes(patchCode) ? 1 : 0;
    }
    patch() {
        if(this.patched() === 1) return console.log(`${this.appName} already patched. Ignoring...`);
        let pref = fs.readFileSync(this.prefPath, "utf8");
        pref += "\n" + patchCode;
        fs.writeFileSync(this.prefPath, pref);
    }
}
