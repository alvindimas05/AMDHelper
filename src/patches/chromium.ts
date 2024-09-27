import path from "path";
import os from "os";
import fs from "fs";
import AppPatch from "@patches/apppatch";
import {PatchType} from "@src/types";
import {
    amdhelperChromiumBash,
    amdhelperChromiumBashName,
    amdhelperChromiumPlist,
    amdhelperChromiumPlistName
} from "@src/scripts/chromium";
import {escapePathSpaces, exec} from "@src/utils";

const chromiumBrowsers = ["Chromium", "Google Chrome", "Arc", "Microsoft Edge", "Brave Browser"];
export const bashPath = path.join("/", "Library", "amdhelper", amdhelperChromiumBashName);
export const plistPath = path.join("/", "Library", "LaunchAgents", amdhelperChromiumPlistName);

export default class Chromium extends AppPatch {
    constructor(appPath: string) {
        super(appPath);
    }
    supported() {
        return chromiumBrowsers.includes(this.appName) || this.isChromiumBrowser() || this.supportElectron();
    }
    supportElectron(){
        return fs.existsSync(path.join(this.appPath, "Contents", "Frameworks", "Electron Framework.framework"))
            || fs.existsSync(path.join(this.appPath, "Contents", "Frameworks", "Chromium Embedded Framework.framework"));
    }
    isChromiumBrowser(): boolean {
        if (!fs.existsSync(path.join(this.appPath, "Contents", "Frameworks"))) return false;
        
        const frameworks = fs.readdirSync(path.join(this.appPath, "Contents", "Frameworks"))
        for(const framework of frameworks){
            if (!framework.startsWith(this.appName) || !framework.endsWith(".framework")) continue;
            return fs.existsSync(path.join(this.appPath, "Contents", "Frameworks", framework, "Helpers",
                `${this.appName} Helper (GPU).app`));
        }
        return false
    }
    selected(): boolean {
        return global.chromiumApps.findIndex(fapp => fapp.name === this.appName) !== -1
    }
    patched() {
        if(this.selected()) return PatchType.SELECTED;
        if(this.isOldPatch()) return PatchType.OLD_PATCH;
        if(this.bashPatched()) return PatchType.PATCHED
        if(this.supportElectron()) return PatchType.EXPERIMENTAL;
        return PatchType.UNPATCHED;
    }
    bashPatched(){
        try {
            return fs.readFileSync(bashPath).toString("utf8").trimStart().split("\n")[0].
                includes(this.appName);
        } catch {
            return false;
        }
    }
    save(){
        fs.writeFileSync(this.configPath!, JSON.stringify(this.config));
    }
    isOldPatch(){
        return (this.config !== undefined && this.config.browser !== undefined &&
            this.config.browser.enabled_labs_experiments !== undefined &&
            this.config.browser.enabled_labs_experiments.some(value => this.oldPatchValues.includes(value)))
    }
}

async function killPatchProcess(){
    // try { await exec(`pkill -f bash`) } catch {}
    try { await exec(`pkill -f amdhelper_chromium`) } catch {}
}

export async function patchChromiumApps(){
    killPatchProcess();
    const apps = global.chromiumApps.map(app => app.name);

    fs.mkdirSync(path.join(bashPath, ".."), { recursive: true });
    fs.writeFileSync(bashPath, amdhelperChromiumBash(apps, global.disableGpuMode));
    await exec(`chmod +x ${escapePathSpaces(bashPath)}`);
    await exec(`chmod 755 ${escapePathSpaces(bashPath)}`);
    await exec(`chown 0:0 ${escapePathSpaces(bashPath)}`);

    fs.writeFileSync(plistPath, amdhelperChromiumPlist);    
}

export async function removePatchChromiumApps(){
    console.log("Removing chromium apps patch...");
    killPatchProcess();
    try { fs.rmSync(bashPath) } catch {}
    try { fs.rmSync(plistPath) } catch {}
}