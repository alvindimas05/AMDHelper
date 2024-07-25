import fs from "fs";
import {parallelizer} from "amdfriend/src/parallelizer";
import {cpus} from "os";
import {walkDirectory} from "amdfriend/src/utils";
import path, {resolve} from "path";
import type {PatchOptions} from "amdfriend/src/types";
import {patchFile} from "amdfriend/src";
import {isRoot, patchOptions} from "@src/utils";
import AppPatch from "@patches/apppatch";

const amdfriends = ["Adobe Photoshop", "CorelDRAW"];

export default class Amdfriend extends AppPatch {
    patchedPath: string;
    constructor(appPath: string) {
        super(appPath);
        this.patchedPath = path.join(this.appPath, "Contents", ".amdhelper");
    }
    patched() {
        const fileExists = fs.existsSync(this.patchedPath);
        if(!isRoot() && !fileExists) return -1;
        return (fileExists ? 1 : 0);
    }
    supported(){
        return amdfriends.some(v => this.appName.includes(v) || v.includes(this.appName));
    }
    async patch(){
        if(this.patched() === 1) return console.log(`${this.appName} already patched. Ignoring...`);
        await parallelizer(this.patchDirectories(), cpus().length);

        if(!isRoot()) fs.writeFileSync(this.patchedPath, "");
    }
    *patchDirectories(): Generator<Promise<void>>{
        for (const dirent of walkDirectory(this.appPath, ["", ".dylib"], [".DS_Store"])) {
            const originalFilePath = resolve(dirent.name);
            yield this.patchPromise(originalFilePath, patchOptions);
        }
    }

    async patchPromise(originalFilePath: string, options: PatchOptions): Promise<void> {
        console.log(`Analyzing and patching file: ${originalFilePath}`);
        const p = await patchFile(originalFilePath, options);

        if (p) {
            console.log(`Routines found for ${originalFilePath}:`);
            console.log(
                p.patchedRoutines
                    .map(x => `- <${x.bytes.toString("hex").toUpperCase().match(/.{1,2}/g)!.join(" ")}> at offset ${x.offset} (Hex: ${x.offset.toString(16)})`)
                    .join("\n")
            );
            console.log(`File ${originalFilePath} was patched.`);
            console.log(`Patched file location: ${p.patchedPath}`);

        }
        console.log(`Finished processing file: ${originalFilePath}`);
    }
}