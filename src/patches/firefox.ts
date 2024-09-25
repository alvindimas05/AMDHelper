import AppPatch from "@patches/apppatch";
import path from "path";
import { homedir } from "os";
import fs from "fs";
import { PatchType } from "@src/types";

const patchCode = 'user_pref("layers.acceleration.disabled", true);';
export default class Firefox extends AppPatch {
    originalAppName = "Firefox";
    firefoxPath = path.join(
        homedir(),
        "Library",
        "Application Support",
        "Firefox",
        "Profiles",
    );
    constructor(appName: string) {
        super(appName);
    }
    supported(): boolean {
        return this.appName === this.originalAppName;
    }
    patched() {
        if (!fs.existsSync(this.firefoxPath)) return PatchType.UNPATCHED;
        try {
            for(const dir of fs.readdirSync(this.firefoxPath)) {
                const prefPath = path.join(this.firefoxPath, dir, "prefs.js");
                if (!fs.existsSync(prefPath)) continue;
                
                if (!fs.readFileSync(prefPath, "utf8").includes(patchCode)) {
                    return PatchType.UNPATCHED;
                }
            };
        } catch {
            return PatchType.UNPATCHED;
        }
        return PatchType.PATCHED;
    }
    async patch() {
        if (this.patched() === PatchType.PATCHED)
            return console.log(`${this.appName} already patched. Ignoring...`);
        try {
            fs.readdirSync(this.firefoxPath).forEach((dir) => {
                const prefPath = path.join(this.firefoxPath, dir, "prefs.js");
                let pref = fs.readFileSync(prefPath, "utf8");
                if (!fs.existsSync(prefPath) || pref.includes(patchCode)) return;
                
                pref += "\n" + patchCode;
                fs.writeFileSync(prefPath, pref);
            });
        } catch (e) {
            console.error(`Error while patching ${this.appName}: ` + e);
        }
    }
}
