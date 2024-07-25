import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import {isRoot, patchOptions, searchFile} from "@src/utils";
import fs from "fs";
import {patchFile} from "amdfriend/src";

const discordPath = path.join(homedir(), "Library", "Application Support", "discord")
export default class Discord extends AppPatch {
    patchedPath: string;
    krispPath: string;
    constructor(appPath: string) {
        super(appPath);
        this.krispPath = path.join(
            discordPath,
            fs.readdirSync(discordPath)
                .filter(a => a != ".DS_Store")
                .sort((a, b) => a.localeCompare(b))[0]
            , "modules", "discord_krisp", "discord_krisp.node");
        this.patchedPath = path.join(this.krispPath, "..", ".amdhelper");
    }
    patched() {
        const fileExists = fs.existsSync(this.patchedPath);
        return (fileExists ? 1 : 0);
    }
    supported(): boolean {
        return this.appName === "Discord";
    }

    async patch(){
        if(this.patched() === 1) return console.log(`${this.appName} already patched. Ignoring...`);
        await patchFile(this.krispPath, patchOptions);

        fs.writeFileSync(this.patchedPath, "");
    }
}