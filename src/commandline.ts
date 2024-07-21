import fs from "fs";
import chalk from "chalk";
import App from "./app.ts";
import inquirer from "inquirer";
import clear from "console-clear";

export default class CommandLine {
    supportedApps: App[];
    async start(){
        this.getSupportedApplication();

        console.log(`${chalk.red("AMD")}Helper\n`);
        console.log(`Applications that can be patched:`)
        this.logSupportedApps();
        console.log("\n")
        console.log("(A) Patch all apps")
        console.log("(Q) Quit")

        const answers = await inquirer.prompt([{ type: "input", name: "option", message: "Select option: " }]);

        this.selectOption(answers.option);
    }
    selectOption(value: string){
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
                    this.supportedApps[val-1].patch()

        }

        const cli = new CommandLine();
        cli.start();
    }
    patchAllApps(){
        this.supportedApps.forEach(app => app.patch());
    }
    logSupportedApps(){
        this.supportedApps.forEach((app, i) => {
            let status: string;
            switch(app.patched()){
                case 1:
                    status = chalk.green("PATCHED");
                    break;
                case -1:
                    status = chalk.red("NOT PATCHED");
                    break;
                default:
                    status = chalk.yellow("UNDETECTED");
            }
            console.log(`${i + 1}. ${app.name} [${status}]`)
        })
    }
    getSupportedApplication(){
        this.supportedApps = [];

        const apps: string[] = fs.readdirSync("/Applications").map((app) => app.replace(/.app/g, ""));
        apps.forEach(name => {
            const app = new App(name);
            if(app.supported()) this.supportedApps.push(app);
        })

        this.supportedApps.sort((a, b) => a.name.localeCompare(b.name));
    }
}