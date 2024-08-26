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
const exeName = "amdhelper_executable"
export default class Chromium extends AppPatch {
    configPath: string | null = null;
    patchValue = "use-angle@1";
    oldPatchValues = ["enable-gpu-rasterization@1", "enable-gpu-rasterization@2"];
    exePath = path.join(this.appPath, "Contents", "MacOS", exeName);
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
        return chromiumBrowsers.includes(this.appName) && this.configPath != null;
    }
    patched() {
        if(this.isOldPatch()) return PatchType.OLD_PATCH;
        return fs.existsSync(this.bashPath) ? PatchType.PATCHED : PatchType.UNPATCHED;
        // return fs.existsSync(this.exePath) ?
        //     PatchType.PATCHED : PatchType.UNPATCHED;
    }
    async patch(){
        if(this.configPath == undefined || this.config == null){
            console.error(`Can't apply patch to ${this.appName}! Config not found.`)
            return;
        }

        if(this.isOldPatch()) this.removeOldPatch();

        if(this.patched()){
            console.log(`${this.appName} already patched. Ignoring...`);
            return;
        }

        console.log(`Applying patch to ${this.appName}...`);

        this.apply();
        this.save();
        await this.addLaunchAgent();
    }
    apply(){
        if(this.config.browser === undefined) this.config.browser = { enabled_labs_experiments: [] };
        if(this.config.browser.enabled_labs_experiments === undefined) this.config.browser.enabled_labs_experiments = [];
        this.config.browser!.enabled_labs_experiments.push(this.patchValue);
        console.log(`Patch applied to ${this.appName}!`)
    }
    save(){
        fs.writeFileSync(this.configPath!, JSON.stringify(this.config));
    }
    isOldPatch(){
        return (this.config.browser !== undefined &&
            this.config.browser.enabled_labs_experiments !== undefined &&
            this.config.browser.enabled_labs_experiments.some(value => this.oldPatchValues.includes(value)))
    }
    async addLaunchAgent(){
        fs.mkdirSync(path.join(this.bashPath, ".."), { recursive: true });
        fs.writeFileSync(this.bashPath,
            amdhelperChromiumBash(this.appName));
        await exec(`sudo chmod +x ${escapePathSpaces(this.bashPath)}`);

        fs.writeFileSync(this.plistPath, amdhelperChromiumPlist);
        child_process.spawn("bash", [this.bashPath], { detached: true});
    }
    // async addExecutable(){
    //     const command = `./${escapePathSpaces(this.appName)} --enable-angle-features=disableBlendFuncExtended`;
    //     fs.writeFileSync(this.exePath, command);
    //     await exec(`sudo chmod +x ${escapePathSpaces(this.exePath)}`);
    //
    //     const plistPath = path.join(this.appPath, "Contents", "Info.plist");
    //     let plist = fs.readFileSync(plistPath).toString("utf8")
    //     const n = plist.lastIndexOf("<key>CFBundleExecutable</key>");
    //     plist = plist.slice(0, n) + plist.slice(n).replace(`<string>${this.appName}</string>`,
    //         `<string>${exeName}</string>`);
    //     fs.writeFileSync(plistPath, plist);
    // }
    // oldApply(){
    //     if(this.config.browser === undefined) this.config.browser = { enabled_labs_experiments: [] };
    //     if(this.config.browser.enabled_labs_experiments === undefined) this.config.browser.enabled_labs_experiments = [];
    //     this.config.browser!.enabled_labs_experiments.push(this.oldPatchValue);
    //     console.log(`Patch applied to ${this.appName}!`)
    // }
    removeOldPatch(){
        if(this.config.browser === undefined) return;
        if(this.config.browser.enabled_labs_experiments === undefined) return;
        this.config.browser!.enabled_labs_experiments =
            this.config.browser!.enabled_labs_experiments.filter(val => !this.oldPatchValues.includes(val));
        this.save();
        console.log(`Removing old patch from ${this.appName}!`)
    }
}