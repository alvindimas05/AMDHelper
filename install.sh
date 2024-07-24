echo "Installing AMDHelper..."
curl -sSL https://github.com/alvindimas05/AMDHelper/releases/latest/download/amdhelper -o amdhelper
chmod +x amdhelper
mv amdhelper /usr/local/bin
echo "AMDHelper installed! Run the command below to start."
echo "sudo amdhelper"