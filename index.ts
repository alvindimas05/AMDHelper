#!/usr/bin/env node
import { promisify } from "util";
import child_process from "child_process";
import CommandLine from "./src/commandline";
import {isRoot} from "./src/utils";

const exec = promisify(child_process.exec);

async function main(){
    if(process.platform != "darwin") return console.error("Sorry, this program is only for AMD Hackintosh.");

    const cpuname = await exec("sysctl -n machdep.cpu.brand_string");
    if(!cpuname.stdout.trim().includes("AMD")) return console.error("Sorry, this program is only for AMD Hackintosh.")

    if(!isRoot()) console.log("Please run as sudo to detect apps that's not patched.");

    const cli = new CommandLine();
    cli.start();
}

main();