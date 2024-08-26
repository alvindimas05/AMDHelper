import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import fs from "fs";
import Firefox from "@patches/firefox";

export default class FirefoxDev extends Firefox {
    originalAppName = "Firefox Developer Edition"
    prefPathName = ".dev-edition-default"
    constructor(appName: string) {
        super(appName);
        this.setPrefPath();
    }
    supported(): boolean {
        return this.appName === this.originalAppName;
    }
}
