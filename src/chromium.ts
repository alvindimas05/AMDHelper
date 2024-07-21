import path from "node:path";
import os from "node:os";
import fs from "fs";

interface ChromiumConfig {
    browser?: {
        enabled_labs_experiments: string[]
    }
}

export default class Chromium {
    browserName: string;
    configPath: string | null = null;
    patchValue = "enable-gpu-rasterization@2";
    config: ChromiumConfig;
    constructor(name: string) {
        this.browserName = name;
        this.setConfigPath();
    }
    setConfigPath(){
        const basePath = path.join(os.homedir(), "Library/Application Support")
        if(this.browserName == "Google Chrome"){
            this.configPath = path.join(basePath, "Google/Chrome/Local State");
            this.setConfig();
            return;
        }

        this.configPath = path.join(basePath, this.browserName, "Local State");
        if(fs.existsSync(this.configPath!)) {
            this.setConfig();
            return;
        }

        this.configPath = path.join(basePath, this.browserName, "User Data/Local State");
        if(fs.existsSync(this.configPath!)) {
            this.setConfig();
            return;
        }
    }
    setConfig(){
        this.config = JSON.parse(fs.readFileSync(this.configPath));
    }
    supported(): boolean {
        return this.configPath != null;
    }
    patched(): boolean {
        return this.config.browser !== undefined &&
            this.config.browser.enabled_labs_experiments !== undefined &&
            this.config.browser.enabled_labs_experiments.includes(this.patchValue);
    }
    patch(){
        if(this.configPath == undefined || this.config == undefined){
            console.error(`Can't apply patch to ${this.browserName}! Config not found.`)
            return;
        }

        if(this.patched()){
            console.log(`${this.browserName} already patched. Ignoring...`);
            return;
        }

        console.log(`Applying patch to ${this.browserName}...`);
        this.apply();
        this.save();
    }
    apply(){
        if(this.config.browser === undefined) this.config.browser = { enabled_labs_experiments: [] };
        if(this.config.browser.enabled_labs_experiments === undefined) this.config.browser.enabled_labs_experiments = [];
        this.config.browser!.enabled_labs_experiments.push(this.patchValue);
        console.log(`Patch applied to ${this.browserName}!`)
    }
    save(){
        fs.writeFileSync(this.configPath!, JSON.stringify(this.config));
    }
}