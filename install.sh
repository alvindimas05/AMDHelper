curl -sL https://raw.githubusercontent.com/alvindimas05/AMDHelper/main/install_ryzenadj.sh | bash

echo "Installing AMDHelper..."
curl -sSL https://github.com/alvindimas05/AMDHelper/releases/latest/download/amdhelper.gz -o amdhelper.gz
tar -xvzf amdhelper.gz
rm amdhelper.gz
chmod +x amdhelper
sudo mv amdhelper /usr/local/bin/amdhelper
echo "AMDHelper installed! Run the command below to start."
echo "sudo amdhelper"