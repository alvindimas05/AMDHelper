import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import {isRoot, patchOptions, searchFile} from "@src/utils";
import fs from "fs";
import {patchFile} from "amdfriend/src";
import {PatchType} from "@src/types";

const discordPath = path.join(homedir(), "Library", "Application Support", "discord")
export default class Discord extends AppPatch {
    originalAppName = "Discord"
    patchedPath: string;
    krispPath: string;
    constructor(appPath: string) {
        super(appPath);

        if(this.supported() && fs.existsSync(discordPath)){
            this.krispPath = path.join(
                discordPath,
                fs.readdirSync(discordPath)
                    .filter(a => a != ".DS_Store")
                    .find(val => val.startsWith("0."))
                , "modules", "discord_krisp", "discord_krisp.node");
            this.patchedPath = path.join(this.krispPath, "..", ".amdhelper");
        }
    }
    patched() {
        const fileExists = fs.existsSync(this.patchedPath);
        return (fileExists ? PatchType.PATCHED : PatchType.UNPATCHED);
    }
    supported(): boolean {
        return this.appName === this.originalAppName;
    }

    async patch(){
        if(this.patched() === PatchType.PATCHED) return console.log(`${this.appName} already patched. Ignoring...`);
        if(!fs.existsSync(discordPath)) return this.missingData();
        await patchFile(this.krispPath, patchOptions);

        fs.writeFileSync(this.patchedPath, "");
    }
}