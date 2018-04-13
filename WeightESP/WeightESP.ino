#include <WiFi.h>
#include <PubSubClient.h>
#include "soc/rtc.h"
#define calibration_factor -10700.00 //This value is obtained using the SparkFun_HX711_Calibration sketch
#include "HX711.h"

#define DOUT  27
#define CLK  26

const char* ssid = "HITRON-6380";
const char* password =  "PMNOU8K3TC90";
const char* mqttServer = "192.168.43.47";
const int mqttPort = 1883;
const char* mqttUser = "falent";
const char* mqttPassword = "mimi1985";




HX711 scale(DOUT, CLK);
float weight;
float second = 1.5;
 
WiFiClient espClient;
PubSubClient client(espClient);
 
void setup() {

  Serial.begin(115200);
  rtc_clk_cpu_freq_set(RTC_CPU_FREQ_80M);

  Serial.println("HX711 scale demo");

  scale.set_scale(calibration_factor); //This value is obtained by using the SparkFun_HX711_Calibration sketch
  scale.tare(); //Assuming there is no weight on the scale at start up, reset the scale to 0

  Serial.println("Readings:");
 

 
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
 
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
 
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
 
    if (client.connect("ESP8266Client", mqttUser, mqttPassword )) {
 
      Serial.println("connected");  
 
    } else {
 
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
 
    }
  }
 
  client.publish("/esp8266/humidity", "Hello from ESP8266");

 
}
 
void callback(char* topic, byte* payload, unsigned int length) {
 
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
 
  Serial.print("Message:");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
 
  Serial.println();
  Serial.println("-----------------------");
 
}
 
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client", mqttUser, mqttPassword )) {
      Serial.println("connected");  
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void loop() {
  if (!client.connected()) {
    reconnect();
  }
  if(!client.loop())

    client.connect("ESP8266Client", mqttUser, mqttPassword );

    weight = (abs(scale.get_units())/2);
    if ( weight<1.5){
      weight =0.0;
    }

    static char weightTemp[7];
    dtostrf((weight), 6, 2, weightTemp);

    client.publish("/weight", weightTemp);
    delay(1300);

  
}
