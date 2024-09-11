import fs from "fs";
import chalk from "chalk";
import App from "@src/app";
import inquirer from "inquirer";
import clear from "console-clear";
import path from "path";
import {PatchType} from "@src/types";
import Chromium, { bashPath, patchChromiumApps, removePatchChromiumApps } from "./patches/chromium";
import { exec } from "./utils";
import child_process from "child_process";

export default class CommandLine {
    basePath = "/Applications/";
    supportedApps: App[];
    async start(){
        console.log(`${chalk.red("AMD")}Helper\n`);
        this.getSupportedApplication();

        console.log(`Applications that can be patched:`)
        this.logSupportedApps();
        console.log("");
        if(global.commandlineChromiumMode){
            if (global.disableGpuMode) {
                console.log(`(G) Use disableBlendFuncExtended patch instead of disable-gpu-rasterization`)  
            } else {
                console.log(`(G) Use disable-gpu-rasterization patch instead of disableBlendFuncExtended`)
            }
            if(global.chromiumApps.length > 0) console.log("(P) Patch selected chromium apps.")
            console.log("(R) Remove chromium apps patch")
        } else {
            console.log("(A) Patch all apps")
        }
        console.log(`(C) ${global.commandlineChromiumMode ? "Exit" : "Enter"} Chromium apps mode (${chalk.rgb(255,99,71)("EXPERIMENTAL")})`)
        console.log("(Q) Quit")

        // @ts-ignore
        const answers = await inquirer.prompt([{ type: "input", name: "option", message: "Select option: " }]);

        await this.selectOption(answers.option);
    }
    async selectOption(value: string){
        clear();
        value = value.toLowerCase();
        switch(value) {
            case "q":
                console.log("Bye!");
                process.exit();
                break;
            case "c":
                global.commandlineChromiumMode = !global.commandlineChromiumMode;
                break;
            case "g":
                global.disableGpuMode = !global.disableGpuMode;
                break;
            case "a":
                if(!global.commandlineChromiumMode){
                    await this.patchAllApps();
                    break;
                }
            case "p":
                if(global.chromiumApps.length > 0){
                    console.log("Applying chromium apps patch...");

                    let runBash = false;
                    const macosVersion = (await exec("sw_vers -productVersion")).stdout;
                    const majorVersion = parseInt(macosVersion.split(".")[0]);
                    const minorVersion = parseInt(macosVersion.split(".")[1]);
                    if(majorVersion > 13 && minorVersion > 3){
                        console.log("You are running on MacOS Sonoma 14.4 or above. You might need to restart to start the patch script.");
                    }
                        
                    await patchChromiumApps();
                    child_process.spawn("bash", [bashPath], { stdio: "ignore", detached: true }).unref();
                    break;
                }
            case "r":
                if(global.commandlineChromiumMode){
                    removePatchChromiumApps();
                    break;
                }
            default:
                const val = parseInt(value);
                if (isNaN(val) || val < 1 || val > this.supportedApps.length + 1) break;
                const app = this.supportedApps[val - 1];
                
                if (global.commandlineChromiumMode) {
                    // @ts-ignore
                    const appPatch: Chromium = app.getAppPatch();
                    if(appPatch.selected()) break;
                    global.chromiumApps.push(app);
                } else {
                    await app.patch()
                }
        }

        const cli = new CommandLine();
        await cli.start();
    }
    async patchAllApps(){
        for(const app of this.supportedApps){
            await app.patch();
        }
    }
    logSupportedApps(){
        this.supportedApps.forEach((app, i) => {
            let status: string;

            switch(app.patched()){
                case PatchType.PATCHED:
                    status = chalk.green("PATCHED");
                    break;
                case PatchType.UNPATCHED:
                    status = chalk.red("NOT PATCHED");
                    break;
                case PatchType.OLD_PATCH:
                    status = chalk.blue("NEW PATCH");
                    break;
                case PatchType.EXPERIMENTAL:
                    status = chalk.rgb(255,99,71)("EXPERIMENTAL");
                    break;
                case PatchType.SELECTED:
                    status = chalk.cyan("SELECTED");
                    break;
                default: status = chalk.yellow("UNDETECTED");
            }

            console.log(`${i + 1}. ${app.name} [${status}]`);
        })
    }
    getSupportedApplication(){
        this.supportedApps = [];
        this.getApps(this.basePath);
        this.supportedApps.sort((a, b) => a.name.localeCompare(b.name));
    }
    getApps(dir: string){
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory() && !filePath.endsWith('.app')) {
                this.getApps(filePath);
            } else if (filePath.endsWith('.app')) {
                const app = new App(filePath);
                if(!app.supported()) continue;
                this.supportedApps.push(new App(filePath));
            }
        }
    }
}