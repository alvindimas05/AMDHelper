import fs from "fs";
import chalk from "chalk";
import App from "@src/app";
import inquirer from "inquirer";
import clear from "console-clear";
import path from "path";
import {PatchType} from "@src/types";

export default class CommandLine {
    basePath = "/Applications/";
    supportedApps: App[];
    async start(){
        console.log(`${chalk.red("AMD")}Helper\n`);
        this.getSupportedApplication();

        console.log(`Applications that can be patched:`)
        this.logSupportedApps();
        console.log("\n(A) Patch all apps")
        console.log(`(E) ${global.patchElectronApps ? "Disable" : "Enable"} patch Electron apps (${chalk.rgb(255,99,71)("EXPERIMENTAL")})`)
        if(global.patchElectronApps) console.log(`(G) ${global.disableGpuMode ? "Disable" : "Enable"} disable-gpu-rasterization patch instead of disableBlendFuncExtended (${chalk.rgb(255,99,71)("EXPERIMENTAL")})`)
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
            case "e":
                global.patchElectronApps = !global.patchElectronApps;
                break;
            case "g":
                if(global.patchElectronApps){
                    global.disableGpuMode = !global.disableGpuMode;
                    break;
                }
            case "a":
                await this.patchAllApps();
                break;
            default:
                const val = parseInt(value);
                if(!isNaN(val) && val <= this.supportedApps.length + 1 && val > 0)
                    await this.supportedApps[val-1].patch()
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