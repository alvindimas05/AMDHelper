export const amdhelperChromiumBashName = "amdhelper_chromium";
export const amdhelperChromiumBash = (appname: string) => `
appname="${appname}"
is_running=0
while [ 1 ]; do
  if [[ $(pgrep -f "$appname") ]]; then
    if [[ $is_running == 0 ]]; then
      pkill -x "$appname"
      sleep 1
      open -a /Applications/"$appname".app --args --enable-angle-features=disableBlendFuncExtended
      echo "Detected user opening $appname..."
      is_running=1
    fi
  else
    if [[ $is_running == 1 ]]; then
      echo "Detected user exiting $appname..."
      is_running=0
    fi
  fi
  sleep 0.1
done
`;

export const amdhelperChromiumPlistName = "org.alvindimas05.amdhelper_chromium.plist";
export const amdhelperChromiumPlist = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.alvindimas05.amdhelper_chromium</string>
    <key>LaunchOnlyOnce</key>
    <true/>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/sh</string>
        <string>/Library/amdhelper/amdhelper_chromium</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
`;