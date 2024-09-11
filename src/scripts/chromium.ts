export const amdhelperChromiumBashName = "amdhelper_chromium";
export const amdhelperChromiumBash = (applist: string[], disableGpuMode = false) => `   
browsers=(${applist.map(item => `"${item}"`).join(" ")})
running_browsers=()

set +e #otherwise the script will exit on error
containsElement () {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 1; done
  return 0
}

while [ 1 ]; do
  for appname in "\${browsers[@]}"; do
    if [[ $(pgrep -x "$appname") ]]; then
      containsElement "\${appname}" "\${running_browsers[@]}"
      if [[ $? == 0 ]]; then
        pkill -x "$appname"
        sleep 1
        open -a /Applications/"$appname".app --args ${disableGpuMode ? "--disable-gpu-rasterization" : "--enable-angle-features=disableBlendFuncExtended --use-angle=gl"}
        echo "Detected user opening $appname..."
        running_browsers+=("$appname")
      fi
    else
      containsElement "\${appname}" "\${running_browsers[@]}"
      if [[ $? == 1 ]]; then
        echo "Detected user exiting $appname..."
        running_browsers=("\${running_browsers[@]/$appname}")
      fi
    fi
  done
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
        <string>/Library/amdhelper/amdhelper_chromium</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
`;