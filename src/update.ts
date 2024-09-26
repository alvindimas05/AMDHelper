import {exec} from "@src/utils";

interface UpdateResponse {
    tag_name: string
}

export async function check_update(){
    try {
        const res = await fetch(process.env.RELEASE_URL);
        const data : UpdateResponse[] = await res.json();
        if(data[0].tag_name === process.env.VERSION) return;
        console.log(`New update version ${data[0].tag_name}! Run "amdhelper -u" to update.`);
    } catch {
        console.log("Can't check AMDHelper update...")
    }
}

export async function update(){
    const curl = await exec(`curl -sL ${process.env.INSTALL_URL}`);
    for(let cmd of curl.stdout.split("\n")){
        if(cmd.length === 0) return;
        const { stdout } = await exec(cmd);
        if(stdout != "") console.log(`${stdout.slice(0, -1)}`);
    }
}
