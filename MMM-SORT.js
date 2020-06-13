/* Magic Mirror
 * Module: MMM-SORT = Static Or Rotating Tides
 *
 * By Mykle1
 * MIT License
 */

Module.register("MMM-SORT", {

    // Module config defaults.
    defaults: {
        apiKey: "",                     // Free apiKey @ https://www.worldtides.info/register
        lat: "",                        // your latitude
        lon: "",                        // your longitude
        mode: "static",                 // static or rotating
        timeFormat: "",
        height: "ft",                   // ft = feet, m = meters for tide height
        LowText: "Low",                 // Low tide text. Whatever you want or nothing ""
        HighText: "High",               // High tide text. Whatever you want or nothing ""
        useHeader: false,               // False if you don't want a header
        header: "",                     // Change in config file. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 3000,           // fade speed
        initialLoadDelay: 3250,
        retryDelay: 2500,
        rotateInterval: 30 * 1000,      // seconds
        updateInterval: 60 * 60 * 1000, // Equals 720 of 1000 free calls a month
    },

    getStyles: function() {
        return ["MMM-SORT.css"];
    },

    getScripts: function(){
		return ['moment.js']; // needed for MM versions without moment
	},

    start: function() {
        Log.info("Starting module: " + this.name);


        //  Set locale.
        this.url = "https://www.worldtides.info/api?extremes&lat=" + this.config.lat + "&lon=" + this.config.lon + "&length=604800&key=" + this.config.apiKey;
        this.tides = [];
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function () {
        console.log("rendering")
let result;
        try {
            result = this.render()
        } catch(e) {
            console.log("error rendeing", e)
        }
        console.log("finished rendering")
return result
    },
    render: function() {

		// create wrapper
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

		// Loading
        if (!this.loaded) {
            wrapper.innerHTML = "First the tide rushes in . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

		// header
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var tides = this.tides;

        var top = document.createElement("div");
        top.classList.add("list-row");


        // place
        var place = document.createElement("div");
        place.classList.add("small", "bright", "place");
        place.innerHTML = this.station;
        top.appendChild(place);

        var LowText = this.config.LowText;
        var HighText = this.config.HighText;

        tides.forEach((tide, index)=> {
            var date = document.createElement("div");
            const klass = index % 2 === 0 ? "date" : "date2"
            const {dt} = tide
            const bright = Date.now() < dt ? "bright": "dimmed"
            date.classList.add("xsmall", bright, klass);
            if (tide.type == "Low") {
                date.innerHTML = "<img class = img src=modules/MMM-SORT/images/low.png width=12% height=12%>"
                    + " &nbsp "
                    + moment.utc(dt).local().format("ddd")
                    + " &nbsp"
                    + moment.utc(dt).local().format(this.config.timeFormat) + " <font color=#FCFF00>" + " &nbsp " + LowText + "</font>" ; // Stackoverflow.com
            } else {
                date.innerHTML = "<img class = img src=modules/MMM-SORT/images/high.png width=12% height=12%>"
                    + " &nbsp "
                    + moment.utc(dt).local().format("ddd")
                    + " &nbsp"
                    + moment.utc(dt).local().format(this.config.timeFormat) + " <font color=#f3172d>" + " &nbsp " + HighText + "</font>"; // Stackoverflow.com
            }
            top.appendChild(date);
        })

        wrapper.appendChild(top);

        return wrapper;
    },


    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_TIDES') {
            this.hide(1000);
            this.updateDom(300);
        }  else if (notification === 'SHOW_TIDES') {
            this.show(1000);
            this.updateDom(300);
        }

    },


    processTides: function(data) {
        this.respLat = data.responseLat; // before extremes object
        this.respLon = data.responseLon; // before extremes object
        this.station = data.station; // before extremes object
        this.tides = data.extremes; // Object
    //	console.log(this.tides); // for checking
        this.loaded = true;

    },

    scheduleCarousel: function() {
        console.log("Carousel of Tides fucktion!");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        console.log("updating")
        setInterval(() => {
            this.getTides();
        }, this.config.updateInterval);
        this.getTides(this.config.initialLoadDelay);
    },

    getTides: function() {
        this.sendSocketNotification('GET_TIDES', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "TIDES_RESULT") {
            this.processTides(payload);
            if (this.config.mode != 'static' && this.rotateInterval == null) {   // if you want static it will return false and will not try to run
            //these statements BOTH have to be true to run... if one is false the other true it will not run. Huge props to Cowboysdude for this!!!
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
