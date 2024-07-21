import { promisify } from "util";
import child_process from "child_process";
import CommandLine from "./src/commandline.ts";

const exec = promisify(child_process.exec);

async function main(){
    if(process.platform != "darwin") return console.error("Sorry, this program is only for AMD Hackintosh.");

    const cpuname = await exec("sysctl -n machdep.cpu.brand_string");
    if(!cpuname.stdout.trim().includes("AMD")) return console.error("Sorry, this program is only for AMD Hackintosh.")

    const cli = new CommandLine();
    cli.start();
}

main();