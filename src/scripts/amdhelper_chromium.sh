appname="Google Chrome"
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