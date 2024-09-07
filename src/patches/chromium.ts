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

export default class Chromium extends AppPatch {
    configPath: string | null = null;
    // patchValue = "use-angle@1";
    oldPatchValues = ["enable-gpu-rasterization@1", "enable-gpu-rasterization@2"];
    bashPath = path.join("/", "Library", "amdhelper", amdhelperChromiumBashName);
    plistPath = path.join("/", "Library", "LaunchAgents", amdhelperChromiumPlistName);
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
            (global.patchElectronApps && this.supportElectron());
    }
    supportElectron(){
        return fs.existsSync(path.join("/Applications", `${this.appName}.app`, "Contents", "Frameworks", "Electron Framework.framework"))
    }
    patched() {
        if(this.isOldPatch()) return PatchType.OLD_PATCH;
        if(this.supportElectron()) return PatchType.EXPERIMENTAL;
        return fs.existsSync(this.bashPath) ?
            PatchType.PATCHED : PatchType.UNPATCHED;
        // return (fs.existsSync(this.bashPath) && this.config.browser !== undefined &&
        //     this.config.browser.enabled_labs_experiments !== undefined &&
        //     this.config.browser.enabled_labs_experiments.includes(this.patchValue))
        //     ? PatchType.PATCHED : PatchType.UNPATCHED;
    }
    async patch(){
        // if(this.configPath == undefined || this.config == null){
        //     console.error(`Can't apply patch to ${this.appName}! Config not found.`)
        //     return;
        // }

        if(this.isOldPatch()) this.removeOldPatch();

        // if(this.patched()){
        //     console.log(`${this.appName} already patched. Ignoring...`);
        //     return;
        // }

        console.log(`Applying patch to ${this.appName}...`);
        if(global.electronApps.indexOf(this.appName) === -1) global.electronApps.push(this.appName);

        // this.apply();
        // this.save();
        await this.addLaunchAgent();
    }
    // apply(){
    //     if(this.config.browser === undefined) this.config.browser = { enabled_labs_experiments: [] };
    //     if(this.config.browser.enabled_labs_experiments === undefined) this.config.browser.enabled_labs_experiments = [];
    //     this.config.browser!.enabled_labs_experiments.push(this.patchValue);
    //     console.log(`Patch applied to ${this.appName}!`)
    // }
    save(){
        fs.writeFileSync(this.configPath!, JSON.stringify(this.config));
    }
    isOldPatch(){
        return (this.config !== undefined && this.config.browser !== undefined &&
            this.config.browser.enabled_labs_experiments !== undefined &&
            this.config.browser.enabled_labs_experiments.some(value => this.oldPatchValues.includes(value)))
    }
    async addLaunchAgent(){
        try {
            await exec(`pkill -f bash`);
        } catch {}

        let apps = chromiumBrowsers;
        if(global.patchElectronApps) apps.push(...global.electronApps);

        fs.mkdirSync(path.join(this.bashPath, ".."), { recursive: true });
        fs.writeFileSync(this.bashPath, amdhelperChromiumBash(apps, global.disableGpuMode));
        await exec(`sudo chmod +x ${escapePathSpaces(this.bashPath)}`);

        fs.writeFileSync(this.plistPath, amdhelperChromiumPlist);
        child_process.spawn("bash", [this.bashPath], { detached: true });
    }
    removeOldPatch(){
        if(this.config.browser === undefined) return;
        if(this.config.browser.enabled_labs_experiments === undefined) return;
        this.config.browser!.enabled_labs_experiments =
            this.config.browser!.enabled_labs_experiments.filter(val => !this.oldPatchValues.includes(val));
        this.save();
        console.log(`Removing old patch from ${this.appName}!`)
    }
}