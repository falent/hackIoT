#!/bin/bash
# A vary simple Bash script, by Tomasz Krajewski, preparing Linux environment for a debian linux distribution
green=`tput setaf 2`
red=`tput setaf 1`
reset=`tput sgr0`


name="gnome-terminal"
echo "${green}Installing $name ${reset}"
echo " "


if [ $(dpkg-query -W -f='${Status}' "$name" 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  apt-get install "$name";
else
	echo "$name is already installed"
fi


name="git"
echo "${green}Installing $name ${reset}"
echo " "


if [ $(dpkg-query -W -f='${Status}' "$name" 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  apt-get install "$name";
else
	echo "$name is already installed"
fi

name="webstorm"
echo "${green}Installing $name ${reset}"
echo " "

# install webstorm

if [ -d /home/$USER/Desktop/IDE/WebStorm ]; then
	echo "$name is already installed"
else
	echo "$name is already installed"
	mkdir ~/Desktop/IDE/
	cd ~/Desktop/IDE/
	wget https://download.jetbrains.com/webstorm/WebStorm-2017.3.4.tar.gz -O WebStorm.tar.gz
	tar xfz WebStorm.tar.gz -C ~/Desktop/IDE
	mv WebStorm-* WebStorm
	cd ~/Desktop/IDE/WebStorm/bin
fi

#install docker
name="docker"
echo "${green}Installing $name ${reset}"

if ! [ -x "$(command -v "$name")" ];
then
  	curl -fsSL https://get.docker.com | sh;
	usermod -aG docker $USER;
else
	echo "$name is already installed"
fi



#clone repository
echo "Cloning git repository"
git clone https://github.com/falent/Alexa_universal_skill_template_cli.git /home/$USER/Desktop/Template/Alexa_universal_skill_template && cd /home/$USER/Desktop/Template/Alexa_universal_skill_template && git pull


shortcutWebstorm = home/$USER/Desktop/webStorm.desktop


touch /home/$USER/Desktop/webStorm.desktop

echo "[Desktop Entry]
Type=Application
Exec=/home/alexa/Desktop/IDE/WebStorm/bin/webstorm.sh
GenericName=webstorm
Icon=/home/alexa/Desktop/IDE/WebStorm/bin/webstorm.svg
Name[en_US]=Webstorm" > /home/$USER/Desktop/webStorm.desktop

touch /home/$USER/Desktop/IDE/completedInstallation.txt;
rm /home/$USER/Desktop/IDE/WebStorm.tar.gz



sudo gnome-terminal \
--tab -e "bash -ic \"sleep 5s; sudo docker rm -f alexa_cli; sudo docker run -v ~/Desktop/Template/Alexa_universal_skill_template:/skill -it --network myNetwork --name alexa_cli falent/alexa-cli ; exec bash\"" \
--tab -e "bash -ic \"sleep 10s; sudo docker rm -f alexa; sudo docker run -v ~/Desktop/Template/Alexa_universal_skill_template:/skill -it --network myNetwork --name alexa falent/alexa_http_server; exec bash\"" \
--tab -e "bash -ic \"sudo docker network create myNetwork; sudo docker rm -f alexa_tunnel; sudo docker run -v ~/Desktop/Template/Alexa_universal_skill_template:/skill -it --network myNetwork --name alexa_tunnel falent/alexa_tunnel; exec bash\"" \
--tab -e "bash -ic \"sleep 30s; sudo service mongod stop; sudo docker rm -f /mongo_database;  sleep 5s; sudo docker rm -f mongo; sudo docker run --name mongo_database -d --network myNetwork -p 27017:27017 mongo --noauth; exec bash\"" \
--tab -e "bash -ic \"sleep 30s; sudo docker rm -f dynamo_database; sudo docker run -v "$PWD":/dynamodb_local_db --network myNetwork -p 8000:8000 --name dynamo_database cnadiminti/dynamodb-local:latest; exec bash\"" \
--tab -e "bash -ic \"sleep 30s; sudo docker rm -f mysql_database ; sudo docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=pass@word01  --network myNetwork --name mysql_database centurylink/mysql; exec bash\"" \



