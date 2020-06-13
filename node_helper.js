/* Magic Mirror
 * Module: MMM-SORT = Static Or Rotating Tides
 *
 * By Mykle1
 * MIT License
 */
const NodeHelper = require('node_helper');
const request = require('request');



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getTides: function(url) {

        // request({
        //     url: url,
        //     method: 'GET'
        // }, (error, response, body) => {
        //     if (!error && response.statusCode == 200) {
        //         var result = JSON.parse(body);
		// 	//	console.log(response.statusCode + result); // for checking
        //         this.sendSocketNotification('TIDES_RESULT', result);
        //     }
        // });
        url = "https://www.tidetimes.org.uk/methil-tide-times"


        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const tideData  = body.match(/High Tide(.*?)<\/tr>/g);
                const extremes = tideData.map((rawData) => {
                    const time = rawData.match(/\d\d:\d\d/)[0];
                    const height = parseFloat(rawData.match(/\d+\.\d+m/)[0]);
                    const tideTime =  new Date()
                    const [hours, minutes] = time.split(":")
                    tideTime.setHours(parseInt(hours))
                    tideTime.setMinutes(parseInt(minutes))
                    return {
                        dt: tideTime.getTime(), //	Date/Time of this extreme (in seconds since the unix epoch).
                        date: tideTime.toISOString(), //Date/Time of this extreme (in ISO 8601 standard date and time format, e.g.: 2017-06-12T19:47+0000 ).
                        height: height, //Height (in meters) of the tide.
                        type: "High",
                    }
                })
                const result = {
                    responseLat: "",
                    responseLon: "",
                    station: "Methil",
                    extremes,
                };
				console.log(response.statusCode, result); // for checking
                this.sendSocketNotification('TIDES_RESULT', result);
            }
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_TIDES') {
            this.getTides(payload);
        }
    }
});
