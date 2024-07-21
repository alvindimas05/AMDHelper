import fs from "fs";
import chalk from "chalk";
import App from "./app.ts";
import inquirer from "inquirer";
import clear from "console-clear";

export default class CommandLine {
    supportedApps: App[];
    async start(){
        clear();
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
        if(value == "q"){
            console.log("Bye!");
            process.exit();
        } else if(value == "a"){
            this.patchAllApps()
        }

        const cli = new CommandLine();
        cli.start();
    }
    patchAllApps(){
        this.supportedApps.forEach(app => app.patch());
    }
    logSupportedApps(){
        this.supportedApps.forEach((app, i) => {
            console.log(`${i + 1}. ${app.name} [${app.patched() ? chalk.green("PATCHED") : chalk.red("NOT PATCHED")}]`)
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