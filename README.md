# AMDHelper

AMDHelper is an app to help patch unsupported apps on AMD Hackintoshes.
This app patches app that use OpenGL and Intel MKL libraries.
This program is experimental and might not fix all of your unsupported apps.

### How this works?
- For apps that uses Intel MKL libraries, it used the [AMDFriend](https://github.com/NyaomiDEV/AMDFriend) to patch.

- For apps that uses Dual Source Blend... (Previously thought to be OpenGL) Sorry to say this, but it's just disabling the GPU features
from the apps. Our only option is to wait for [NootedRed](https://github.com/ChefKissInc/NootedRed) to fix this issue.

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
