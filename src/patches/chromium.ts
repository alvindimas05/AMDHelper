import path from "path";
import os from "os";
import fs from "fs";
import AppPatch from "@patches/apppatch";
import {PatchType} from "@src/types";

interface ChromiumConfig {
    browser?: {
        enabled_labs_experiments: string[]
    }
}

const chromiumBrowsers = ["Chromium", "Google Chrome", "Arc", "Microsoft Edge", "Brave"];

export default class Chromium extends AppPatch {
    configPath: string | null = null;
    patchValue = "enable-gpu-rasterization@2";
    // @ts-ignore
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
        // @ts-ignore
        this.config = JSON.parse(fs.readFileSync(this.configPath));
    }
    supported() {
        return chromiumBrowsers.includes(this.appName) && this.configPath != null;
    }
    patched() {
        return (this.config.browser !== undefined &&
            this.config.browser.enabled_labs_experiments !== undefined &&
            this.config.browser.enabled_labs_experiments.includes(this.patchValue)) ?
            PatchType.PATCHED : PatchType.UNPATCHED;
    }
    patch(){
        if(this.configPath == undefined || this.config == undefined){
            console.error(`Can't apply patch to ${this.appName}! Config not found.`)
            return;
        }

        if(this.patched()){
            console.log(`${this.appName} already patched. Ignoring...`);
            return;
        }

        console.log(`Applying patch to ${this.appName}...`);
        this.apply();
        this.save();
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
}