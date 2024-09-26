import { escapePathSpaces, exec } from "@src/utils";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";

const bashPath = path.join("/", "Library", "amdhelper", "amdhelper_ryzenadj");
const plistPath = path.join("/", "Library", "LaunchAgents", "org.alvindimas05.amdhelper_ryzenadj.plist");
const tuning = "--stapm-limit=13000 --slow-limit=14000 --fast-limit=15000 --vrm-current=11000 --vrmmax-current=16000 --vrmsoc-current=0 --vrmsocmax-current=0 --vrmgfx-current=0 --psi0-current=0 --psi0soc-current=0 --tctl-temp=59 --apu-skin-temp=59 --stapm-time=64 --slow-time=128 --power-saving"
export default class Ryzenadj {
    enabled(){
        return fs.existsSync(bashPath) || fs.existsSync(plistPath);
    }
    async apply(){
        // @ts-ignore
        const answers = await inquirer.prompt([{ type: "input", name: "password", message: "Enter Password: " }]);

        await this.installRyzenadj();
        
        try { await exec("sudo ryzenadj " + tuning) } catch {}
        
        console.log("Applying battery optimization...");
        
        fs.mkdirSync(path.join(bashPath, ".."), { recursive: true });
        fs.writeFileSync(bashPath, `echo '${answers.password}' | sudo -S /usr/local/bin/ryzenadj ${tuning}`);
        await exec(`sudo chmod +x ${escapePathSpaces(bashPath)}`);
        
        fs.writeFileSync(plistPath, plist);
    }
    async installRyzenadj(){
        const curl = await exec(`curl -sL ${process.env.INSTALL_RYZENADJ_URL}`);
        for(let cmd of curl.stdout.split("\n")){
            if(cmd.length === 0) return;
            const { stdout } = await exec(cmd);
            if(stdout != "") console.log(`${stdout.slice(0, -1)}`);
        }
    }
    async remove(){
        console.log("Removing battery optimization...");
        try { fs.rmSync(bashPath) } catch {}
        try { fs.rmSync(plistPath) } catch {}
    }
}
const plist = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.alvindimas05.amdhelper_ryzenadj</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Library/amdhelper/amdhelper_ryzenadj</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>`