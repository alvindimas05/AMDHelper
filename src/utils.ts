// @ts-ignore
import {promisify} from "util";
import child_process from "child_process";

export const isRoot = () => process!.getuid() === 0 ;

export const exec = promisify(child_process.exec);
