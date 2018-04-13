**There are three ways to set-up your environment for developing Alexa skills during our Hackathon  on February 26, 2018**. You can use ready VM (https://drive.google.com/file/d/1njIgepwzL85JYFIMrVLIcdbe4wL6FlV7/view ) or use described here Docker Solution with your lokal machine or programm Alexa in the other way ;)

My solution is based on node.js and lokal docker environment. You can add to your development stack so many technologies you want. Everything is possible with Docker!

# 1 Amazon Developer Account

[Please register at the Amazon Developer Portal ](http://developer.amazon.com/)
It's free of charge. If you already have an Amazon account, then you don't have to register. You can use the credentials of your existing account. Without the Amazon Developer Console you won't be able to write an Alexa skill.


# 2 BeSpoken

Install beSpoken:

`$ npm install bespoken-tools -g`

Open
`$ bst lambda proxy dist/app/src/index.js`


# 3 Docker Containers 

Open a first terminal tab and clone my git repository from Github:

`$ git clone https://github.com/falent/Alexa_universal_skill_template_cli.git  ~/Desktop/Template/Alexa_universal_skill_template `

Go to the cloned git repository:

`$ cd ~/Desktop/Template/Alexa_universal_skill_template`

Create a new Docker network:

`$ sudo docker network create myNetwork`

Open a new tab and run the _ngrok_ Docker container in your terminal:

* On Linux:

`$ sudo docker run -v ~/Desktop/Template/Alexa_universal_skill_template:/skill -it --network myNetwork --name alexa_tunnel falent/alexa_tunnel `
  
* On Windows:
  Replace the path with the absolute path to your cloned git repository, e.g. _//c/Users/john/Desktop/Alexa_universal_skill_template_ (:warning: Leading double slashes!!!).

  `$ docker run -v <ABSOLUTE_PATH_TO_CLONED_GIT_REPO>:/skill -it --network myNetwork --name alexa_tunnel falent/alexa_tunnel`

Open a new tab and run an _Alexa_ Docker container:

* On Linux:

  `$ sudo docker run -v ~/Desktop/Template/Alexa_universal_skill_template:/skill -it --network myNetwork --name alexa falent/alexa_http_server`
  
* On Windows:

  `$ docker run -v <ABSOLUTE_PATH_TO_CLONED_GIT_REPO>:/skill -it --network myNetwork --name alexa falent/alexa_http_server`
  
(it can happens that you wish to add more modules to your skill. In that case you just need to restart your container)

Open a new terminal tab and start Alexa CLI Container:

  `$  sudo docker run -v ~/Desktop/Template/Alexa_universal_skill_template:/skill -it --network myNetwork --name alexa_cli falent/alexa-cli`


You can add to your stack also any database f.e

Run a _MongoDB_ Docker container:

`$ sudo docker run --name mongo_database -d --network myNetwork -p 27017:27017 mongo --noauth `

Run a _DynamoDB_ Docker container:

* On Linux:

  `$ sudo docker run -v "$PWD":/dynamodb_local_db --network myNetwork -p 8000:8000 --name dynamo_database cnadiminti/dynamodb-local:latest`

* On Windows:

  `$ docker run -v //c/temp:/dynamodb_local_db --network myNetwork -p 8000:8000 --name dynamo_database cnadiminti/dynamodb-local`


# 4 Configuration
Amazon supporting since couple months a new tool: Alexa CLI. With that tool you can faster develop a skill in your console rather than in a developer portal.

In docker terminal tab Alexa CLI just write:

  `$ ask init --no-browser`

You log to your account using browser authentication. 

now in the cli docker container just write:

  `ask deploy`

everything is ready now!


# Test your docker or VM environment

you can use new alexa simulator which is included in your amazon developer portal:
https://developer.amazon.com/edw/home.html#/skills
just get in to your new skill > Test

If you would like to test if your docker containers works fine you can also use any api client

I will use a chrome extension postan
https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop

1. open postamn chrome app 

2. Near the top center of the screen is a box with the words "Enter request URL." Paste your ngrok address. In my case it was https://6b926c57.ngrok.io

3. Change the GET dropdown to POST.

4. Below the textbox, click the Headers tab. For the key, use "Content-Type", and for the value, use "application/json."

5. On the Body tab, choose "raw" from the radio buttons, and paste the folowing request. After that click send. You will get a response in your alexa skill container and in postman!


```javascript
{
  "session": {
    "new": true,
    "sessionId": "SessionId.4604ef05-bfb5-4e2f-9938-3959deff4ae8",
    "application": {
      "applicationId": "amzn1.ask.skill.a875473a-45b2-4dee-b2af-fa75cda0a569"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AGV2VQ76GKAVKFJUDMSHTBV7X367XX3R2VG3QAQBABUGPSULXNDV5RBCGBDBTR4EMDAPYDQBNGR776NSTJ5LRNKFHRLOGCCXQ2J6ATWF7XZJAYQU45NGG5AFIVM5G3SJZ2VW7ACYWSC4YEGVJOPLL72RFHGKFXXHMCWRWDESXJJH2XTOQ53JODYYD4767AUZPRV3VLMXTVHBSWI"
    }
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.9531eadb-edbe-4fe2-a090-47a9bdd467a3",
    "intent": {
      "name": "ContactIntent",
      "slots": {}
    },
    "locale": "de-DE",
    "timestamp": "2018-02-11T14:56:19Z"
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "application": {
        "applicationId": "amzn1.ask.skill.a875473a-45b2-4dee-b2af-fa75cda0a569"
      },
      "user": {
        "userId": "amzn1.ask.account.AGV2VQ76GKAVKFJUDMSHTBV7X367XX3R2VG3QAQBABUGPSULXNDV5RBCGBDBTR4EMDAPYDQBNGR776NSTJ5LRNKFHRLOGCCXQ2J6ATWF7XZJAYQU45NGG5AFIVM5G3SJZ2VW7ACYWSC4YEGVJOPLL72RFHGKFXXHMCWRWDESXJJH2XTOQ53JODYYD4767AUZPRV3VLMXTVHBSWI"
      },
      "device": {
        "supportedInterfaces": {}
      }
    }
  },
  "version": "1.0"
}
```


# Instructions for a quick deployment to Heroku

* Sign up for [Heroku](https://signup.heroku.com/dc) (it's for free).
* Execute the following shell commands:
  ```bash
  $ (wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh | sh)
  heroku login
  heroku apps:create --region eu
  heroku config:set NPM_CONFIG_PRODUCTION=false
  git add .
  git commit -m "my first commit"
  git push heroku master
  heroku ps:scale web=1
  heroku logs --tail
  ```

