// @ts-ignore
import {promisify} from "util";
import child_process from "child_process";
import type {PatchOptions} from "amdfriend/src/types";
import fs from "fs";
import path from "path";

export const isRoot = () => process!.getuid() === 0 ;

export const exec = promisify(child_process.exec);
export const patchOptions: PatchOptions = {backup: false, clearXA: false, dryRun: false, inPlace: true, sign: true };

export function searchFile(dirPath: string, fileName: string): string | null {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);

        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory()) {
            const result = searchFile(filePath, fileName);
            if (result) return result;
        } else if (file === fileName) {
            return filePath;
        }
    }
    return null;
}