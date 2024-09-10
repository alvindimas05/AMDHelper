import App from "./app";

export {}

declare global {
    var commandlineChromiumMode: boolean;
    var disableGpuMode: boolean;
    var chromiumApps: App[];
}