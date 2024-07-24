# AMDHelper

AMDHelper is an app to help patch unsupported apps on AMD Hackintoshes.
This app patches app that use OpenGL and Intel MKL libraries.
This program is experimental and might not fix all of your unsupported apps.

### How this works?
- For apps that uses Intel MKL libraries, it used the [AMDFriend](https://github.com/NyaomiDEV/AMDFriend) to patch.

- For apps that uses OpenGL... Sorry to say this, but it's just disabling the GPU features
from the apps. Our only option is to wait for NootedRed to fix this issue.

### How to use?

Install (or update) AMDHelper on your system 
```
curl -sL https://raw.githubusercontent.com/alvindimas05/AMDHelper/main/install.sh | bash
```

Run AMDHelper (Please run as sudo)
```
sudo amdhelper
```

## Credits
- [VisualEhrmanntraut](https://github.com/VisualEhrmanntraut) for developing [NootedRed](https://github.com/ChefKissInc/NootedRed)
to support Hackintosh on AMD iGPU.
- [NyaomiDEV](https://github.com/NyaomiDEV) for developing [AMDFriend](https://github.com/NyaomiDEV/AMDFriend)
to be able patch apps that uses Intel MKL libraries.