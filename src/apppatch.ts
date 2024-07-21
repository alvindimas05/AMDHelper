export default class AppPatch {
    appName: string;
    appPath: string;
    constructor(appPath: string) {
        this.appPath = appPath;
        this.appName = appPath.split("/").pop()!.replace(/.app/g, '');
    }
    patched(): number {
        return -1;
    }
    patch(){}
    supported(): boolean {
        return false;
    }
}