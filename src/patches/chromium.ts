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
import child_process from "child_process";

interface ChromiumConfig {
    browser?: {
        enabled_labs_experiments: string[]
    }
}

const chromiumBrowsers = ["Chromium", "Google Chrome", "Arc", "Microsoft Edge", "Brave"];
export const bashPath = path.join("/", "Library", "amdhelper", amdhelperChromiumBashName);
export const plistPath = path.join("/", "Library", "LaunchAgents", amdhelperChromiumPlistName);

export default class Chromium extends AppPatch {
    configPath: string | null = null;
    // patchValue = "use-angle@1";
    oldPatchValues = ["enable-gpu-rasterization@1", "enable-gpu-rasterization@2"];
    config: ChromiumConfig;
    constructor(appPath: string) {
        super(appPath);

        this.setConfigPath();
    }
    setConfigPath(){
        const basePath = path.join(os.homedir(), "Library/Application Support")
        if(this.appName == "Google Chrome"){
            this.configPath = path.join(basePath, "Google/Chrome/Local State");
            this.setConfig();
            return;
        }

        this.configPath = path.join(basePath, this.appName, "Local State");
        if(fs.existsSync(this.configPath!)) {
            this.setConfig();
            return;
        }

        this.configPath = path.join(basePath, this.appName, "User Data/Local State");
        if(fs.existsSync(this.configPath!)) {
            this.setConfig();
            return;
        }
        this.configPath = null;

    }
    setConfig(){
        this.config = JSON.parse(fs.readFileSync(this.configPath).toString("utf8"));
    }
    supported() {
        return (chromiumBrowsers.includes(this.appName) && this.configPath != null) ||
        this.supportElectron();
    }
    supportElectron(){
        return fs.existsSync(path.join("/Applications", `${this.appName}.app`, "Contents", "Frameworks", "Electron Framework.framework"))
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
    removeOldPatch(){
        if (!this.isOldPatch()) return;
        if(this.config.browser === undefined) return;
        if(this.config.browser.enabled_labs_experiments === undefined) return;
        this.config.browser!.enabled_labs_experiments =
            this.config.browser!.enabled_labs_experiments.filter(val => !this.oldPatchValues.includes(val));
        this.save();
        console.log(`Removing old patch from ${this.appName}!`)
    }
}

async function killPatchProcess(){
    try { await exec(`pkill -f bash`) } catch {}
    try { await exec(`pkill -f amdhelper_chromium`) } catch {}
}

export async function patchChromiumApps(){
    killPatchProcess();
    const apps = global.chromiumApps.map(app => app.name);

    fs.mkdirSync(path.join(bashPath, ".."), { recursive: true });
    fs.writeFileSync(bashPath, amdhelperChromiumBash(apps, global.disableGpuMode));
    await exec(`sudo chmod +x ${escapePathSpaces(bashPath)}`);

    fs.writeFileSync(plistPath, amdhelperChromiumPlist);    
}

export async function removePatchChromiumApps(){
    console.log("Removing chromium apps patch...");
    killPatchProcess();
    try { fs.rmSync(bashPath) } catch {}
    try { fs.rmSync(plistPath) } catch {}
}