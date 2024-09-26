browsers=("Google Chrome" "Arc")
running_browsers=()

set +e #otherwise the script will exit on error
containsElement () {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 1; done
  return 0
}

while [ 1 ]; do
  for appname in "${browsers[@]}"; do
    if [[ $(pgrep -x "$appname") ]]; then
      containsElement "${appname}" "${running_browsers[@]}"
      if [[ $? == 0 ]]; then
        pkill -x "$appname"
        sleep 1
        open -a /Applications/"$appname".app --args --enable-angle-features=disableBlendFuncExtended --use-angle=gl
        echo "Detected user opening $appname..."
        running_browsers+=("$appname")
      fi
    else
      containsElement "${appname}" "${running_browsers[@]}"
      if [[ $? == 1 ]]; then
        echo "Detected user exiting $appname..."
        running_browsers=("${running_browsers[@]/$appname}")
      fi
    fi
  done
  sleep 0.1
done