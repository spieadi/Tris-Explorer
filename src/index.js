'use strict';
const Alexa = require('alexa-sdk');
const wiki = require('./wiki.js');
var Data = [];
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = "amzn1.ask.skill.21c1d2d0-bc73-4621-bd18-0bd16914c3eb";
    alexa.registerHandlers(handlers);
    initialize(event,function(){
        alexa.execute();
    });
};

function initialize(event,callback){
    if(event.session.attributes.Wiki === undefined){
        event.session.attributes.Wiki={};
    }
    callback();
}
const handlers = {
    'LaunchRequest': function () {
        var Welcome_message = "Hello I am Tris. I know everything that happened in the world. I will tell the events, births and deaths that occurred on a date. just give me a random date?";
        this.emit(":askWithCard",Welcome_message,Welcome_message,"The Date Skill",Welcome_message);    
    },
    'EventIntent': function () {
        if (this.event.request.intent.slots.Date.value) {
        var date = new Date(this.event.request.intent.slots.Date.value);
        } else {
            this.emit(':ask', 'Thats not a valid date. ask me any random date. you can ask me  what happened on 12th february','could you say this again');
            
        }
    
        
        var Formatted_date = date.getDate() + "_" + months[(date.getMonth())];
       var dd = Date.parse(Formatted_date);
        var self = this;
        
        wiki.DataFromWikipedia(Formatted_date, function callback(data){
			Data[0] = "The list of events that occurred on this date, <p> " + data.Data1[0] + "</p> <p>" + data.Data1[1] + "</p> <p>" + data.Data1[2] + "</p>";
			Data[1] = "The famous personalities born on this date, <p> " + data.Data2[0] + "</p> <p>" + data.Data2[1] + "</p> <p>" + data.Data2[2] + "</p>";
			Data[2] = "The famous personalities who died on this date, <p> " + data.Data3[0] + "</p> <p>" + data.Data3[1] + "</p> <p>" + data.Data3[2] + "</p>";
        });
        
        function response(){
            self.attributes.Wiki.index = 0;
            var EventData = Data[0];
            var EventDataCard = EventData.replace(/(<([^>]+)>)/ig, "\n");
            
            
            self.emit(':askWithCard',EventData + "open your alexa app for more details. Do you wish to know the famous personalities born on this date?",EventData + "Do you wish to know the famous personalities born on this date?","Events on this date",EventDataCard);
        }
        
        setTimeout(function (){response();}, 2000);
    },

    'AMAZON.YesIntent' : function(){
		this.attributes.Wiki.index = this.attributes.Wiki.index + 1;
		var index = this.attributes.Wiki.index;
		if(index === 1){
			var BirthsData = Data[index];
			var BirthsDataCard = BirthsData.replace(/(<([^>]+)>)/ig, "\n");
			this.emit(':askWithCard',BirthsData + "I have sent the same to your Alexa app. Do you wish to know the famous personalities who died on this date?", BirthsData + "Do you wish to know the famous personalities who died on this date?","Births on this date",BirthsDataCard);    
		}else if(index === 2){
			var DeathsData = Data[index];
			var DeathsDataCard = DeathsData.replace(/(<([^>]+)>)/ig, "\n");
			this.emit(':tellWithCard',DeathsData + "Check your Alexa app I. have sent the same there. hope it was helpful. come again with another date. See you again soon. goodbye and have a nice day","Deaths on this date",DeathsDataCard);
		}
    },
    'AMAZON.NoIntent': function () {
       this.emit(':tell', 'Thank you. this is tris signing off, See you again soon with another date.');
          this.emit('AMAZON.StopIntent');
        
    },
    'AMAZON.HelpIntent': function () {
        const Help_message = "Give me a date, and I will tell the events, births and deaths on the date. Try asking me What are the events that occured on 15th August";
        this.emit(':ask', Help_message, Help_message);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Thank you, See you again soon');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Thank You, I am tris. nice to meet you. See you again soon with another date.');
    },
    'Unhandled': function () {
     const speech_output = 'Goodbye and take care!'
     this.emit(':tell', speech_output);
}
    
};

 
