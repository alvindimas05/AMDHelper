import AppPatch from "@patches/apppatch";
import path from "path";
import {homedir} from "os";
import fs from "fs";
import Firefox from "@patches/firefox";

const firefoxPath = path.join(homedir(), "Library", "Application Support", "Firefox", "Profiles")
export default class FirefoxDev extends Firefox {
    constructor(appName: string) {
        super(appName);
        this.setPrefPath(".dev-edition-default")
    }
    supported(): boolean {
        return this.appName === "Firefox Developer Edition";
    }
}
