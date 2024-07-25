type Patched = 1 | 0 | -1;

export default class AppPatch {
    appName: string;
    appPath: string;
    constructor(appPath: string) {
        this.appPath = appPath;
        this.appName = appPath.split("/").pop()!.replace(/.app/g, '');
    }
    patched(): Patched {
        throw new Error(`Method "patched" must be implemented on class ${this.constructor.name}`);
    }
    patch() {
        throw new Error(`Method "patch" must be implemented on class ${this.constructor.name}`);
    }
    supported(): boolean {
        throw new Error(`Method "supported" must be implemented on class ${this.constructor.name}`);
    }
}