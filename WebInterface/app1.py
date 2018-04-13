"""

A small Test application to show how to use Flask-MQTT.

"""

import eventlet
import json
from flask import Flask, render_template
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_bootstrap import Bootstrap
import pymongo
import sys
import datetime

now = datetime.datetime.now()
eventlet.monkey_patch()



app = Flask(__name__)
app.config['SECRET'] = 'my secret key'
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['MQTT_BROKER_URL'] = '192.168.43.47'
app.config['MQTT_BROKER_PORT'] = 1883
app.config['MQTT_USERNAME'] = 'falent'
app.config['MQTT_PASSWORD'] = 'mimi1985'
app.config['MQTT_KEEPALIVE'] = 5
app.config['MQTT_TLS_ENABLED'] = False
app.config['MQTT_LAST_WILL_TOPIC'] = 'home/lastwill'
app.config['MQTT_LAST_WILL_MESSAGE'] = 'bye'
app.config['MQTT_LAST_WILL_QOS'] = 2


mqtt = Mqtt(app)
socketio = SocketIO(app)
bootstrap = Bootstrap(app)
connection = pymongo.Connection("mongodb://localhost", safe=True)

db = connection.weight
result = db.result

@app.route('/')
def index():
    return render_template('index.html')




@socketio.on('subscribe')
def handle_subscribe(json_str):
    data = json.loads(json_str)
    mqtt.subscribe(data['topic'], data['qos'])


@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    data = dict(
        topic=message.topic,
        payload=message.payload.decode(),
        qos=message.qos,
    )
    print(message.payload.decode())
    insert(message.payload.decode(), now.strftime("%d-%m-%Y %H:%M"))
    socketio.emit('mqtt_message_weight', data)



@mqtt.on_log()
def handle_logging(client, userdata, level, buf):
    pass	
    #print(level, buf)


# Function to insert data into mongo db
def insert(your_weight, times):


    try:
        if (your_weight>20):
            my_result = {'weight': your_weight, 'time': times}
            result.insert(my_result)
            print ('\nInserted data successfully\n')
    except Exception, e:
        print str(e)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=True, debug=True)

