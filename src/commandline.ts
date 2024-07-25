import fs from "fs";
import chalk from "chalk";
import App from "@src/app";
import inquirer from "inquirer";
// @ts-ignore
import clear from "console-clear";
import path from "path";

export default class CommandLine {
    basePath = "/Applications/";
    // @ts-ignore
    supportedApps: App[];
    async start(){
        this.getSupportedApplication();

        // @ts-ignore
        console.log(`${chalk.red("AMD")}Helper\n`);
        console.log(`Applications that can be patched:`)
        this.logSupportedApps();
        console.log("\n")
        console.log("(A) Patch all apps")
        console.log("(Q) Quit")

        // @ts-ignore
        const answers = await inquirer.prompt([{ type: "input", name: "option", message: "Select option: " }]);

        this.selectOption(answers.option);
    }
    async selectOption(value: string){
        clear();
        value = value.toLowerCase();
        switch(value) {
            case "q":
                console.log("Bye!");
                process.exit();
                break;
            case "a":
                this.patchAllApps();
                break;
            default:
                const val = parseInt(value);
                if(!isNaN(val) && val <= this.supportedApps.length + 1 && val > 0)
                    await this.supportedApps[val-1].patch()

        }

        const cli = new CommandLine();
        await cli.start();
    }
    patchAllApps(){
        this.supportedApps.forEach(app => app.patch());
    }
    logSupportedApps(){
        this.supportedApps.forEach((app, i) => {
            let status: string;
            switch(app.patched()){
                case 1:
                    // @ts-ignore
                    status = chalk.green("PATCHED");
                    break;
                case 0:
                    // @ts-ignore
                    status = chalk.red("NOT PATCHED");
                    break;
                // @ts-ignore
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