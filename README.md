# AMDHelper

AMDHelper is an experimental application designed to help patch unsupported apps on AMD Hackintoshes.
It specifically addresses issues with apps that rely on Dual Source Blend
(previously assumed to be an OpenGL issue) and Intel MKL libraries.
While AMDHelper can resolve some compatibility problems, it may not fix all unsupported apps.

### How this works?
- For apps utilizing Intel MKL libraries, AMDHelper employs [AMDFriend](https://github.com/NyaomiDEV/AMDFriend) to patch these libraries for better compatibility.

- For apps relying on Dual Source Blend, the current solution is to disable GPU features within the app.
Unfortunately, this is a temporary workaround, and we must wait for [NootedRed](https://github.com/ChefKissInc/NootedRed) to provide a more permanent fix.

### How to use?

Install (or update) AMDHelper on your system 
```
curl -sL https://raw.githubusercontent.com/alvindimas05/AMDHelper/main/install.sh | bash
```

Run AMDHelper (Please run as sudo)
```
sudo amdhelper
```

### Building Manually

You want to change the code and build it manually? Here are the steps
1. Install Node.js 18.19.0 using [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)
(The version needs to be specific due to [nexe](https://github.com/nexe/nexe) Node.js version)
2. Install [bun](https://bun.sh/) runtime
3. Run ```bun run build```
4. Your build should be ready at ```build/amdhelper```

## Credits
- [VisualEhrmanntraut](https://github.com/VisualEhrmanntraut) for developing [NootedRed](https://github.com/ChefKissInc/NootedRed)
to support Hackintosh on AMD iGPU.
- [tomnic](https://macos86.it/profile/69-tomnic/) for [guide](https://macos86.it/topic/5489-tutorial-for-patching-binaries-for-amd-hackintosh-compatibility/)
to patch apps that uses Intel MKL libraries.
- [NyaomiDEV](https://github.com/NyaomiDEV) for developing [AMDFriend](https://github.com/NyaomiDEV/AMDFriend)
to automatically patch apps that uses Intel MKL libraries.
- [gmatht](https://github.com/gmatht) for script code [gz99](https://github.com/gmatht/joshell/blob/master/scripts/gz99)
script for better compression.
- [FlyGoat](https://github.com/FlyGoat) for developing [RyzenAdj](https://github.com/FlyGoat/RyzenAdj) to add power management feature.
- [ExtremeXT](https://github.com/ExtremeXT) for providing compiled MacOs version of [RyzenAdj](https://github.com/FlyGoat/RyzenAdj).