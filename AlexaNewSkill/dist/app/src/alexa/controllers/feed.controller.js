// audio.controller.js

const SyncRequest = require('sync-request');
const xml2js = require('xml2js');

var audioData;
var res = SyncRequest('GET',"http://intrinsify.libsyn.com/rss");
var parseString = xml2js.parseString;
var audioDataAll = [];

parseString(res.getBody(), function(err,result){
  
    for (i = 0; i < (result['rss']['channel'][0]['item']).length; i++) {
        var raw = result['rss']['channel'][0]['item'][i]['enclosure'][0]['$']['url'];
        var url = raw.replace("http", "https") ;
        var title = result['rss']['channel'][0]['item'][i]['title'][0];
        var rssDate = result['rss']['channel'][0]['item'][i]['pubDate'][0];
        var date = new Date(rssDate);
        //From blog you get date which differes +4 hours in ms with podcasts
        audioData = {"title":title,"url":url, "date":date.getTime()+4*3600000, "dateReadable": rssDate};
        audioDataAll.push(audioData);

  }
});
module.exports = audioDataAll;
