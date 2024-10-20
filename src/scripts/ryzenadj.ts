import { escapePathSpaces, exec } from "@src/utils";
import fs from "fs";
import path from "path";

const localBinPath = escapePathSpaces("/usr/local/bin");
const ryzenadjPath = escapePathSpaces(`${localBinPath}/ryzenadj`);
const plistPath = escapePathSpaces(
    "/Library/LaunchDaemons/org.alvindimas05.ryzenadj.plist"
);

export default class Ryzenadj {
    enabled() {
        return fs.existsSync(ryzenadjPath) || fs.existsSync(plistPath);
    }
    async apply() {
        console.log("Applying battery optimization...");

        await exec(`mkdir -p ${localBinPath}`);
        await exec(
            `curl -sL https://github.com/alvindimas05/AMDHelper/raw/refs/heads/main/ryzenadj -o ${ryzenadjPath}`
        );
        await exec(`xattr -c ${ryzenadjPath}`);
        await exec(`chmod 755 ${ryzenadjPath}`);
        await exec(`chown 0:0 ${ryzenadjPath}`);
        fs.writeFileSync(plistPath, plist);
        await exec(`xattr -c ${plistPath}`);
        await exec(`chmod 644 ${plistPath}`);
        await exec(`chown 0:0 ${plistPath}`);
        await exec(`launchctl load ${plistPath}`);
    }
    async remove() {
        console.log("Removing battery optimization...");

        await exec(`launchctl unload ${plistPath}`);
        try {
            fs.rmSync(ryzenadjPath);
        } catch {}
        try {
            fs.rmSync(plistPath);
        } catch {}
    }
}

const plist = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>EnablePressuredExit</key>
	<true/>
	<key>KeepAlive</key>
	<false/>
	<key>Label</key>
	<string>org.alvindimas05.ryzenadj</string>
	<key>OnDemand</key>
	<false/>
	<key>ProcessType</key>
	<string>App</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/local/bin/ryzenadj</string>
		<string>--stapm-limit=13000</string>
		<string>--slow-limit=14000</string>
		<string>--fast-limit=15000</string>
		<string>--vrm-current=11000</string>
		<string>--vrmmax-current=16000</string>
		<string>--vrmsoc-current=0</string>
		<string>--vrmsocmax-current=0</string>
		<string>--vrmgfx-current=0</string>
		<string>--psi0-current=0</string>
		<string>--psi0soc-current=0</string>
		<string>--tctl-temp=59</string>
		<string>--apu-skin-temp=59</string>
		<string>--stapm-time=64</string>
		<string>--slow-time=128</string>
		<string>--power-saving</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>StandardErrorPath</key>
	<string>/tmp/ryzenadj.err.log</string>
	<key>StandardOutPath</key>
	<string>/tmp/ryzenadj.log</string>
	<key>ThrottleInterval</key>
	<integer>1</integer>
	<key>UserName</key>
	<string>root</string>
</dict>
</plist>
`;
