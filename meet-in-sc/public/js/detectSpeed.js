/*************************************
 * detectSpeed
 * @param earl
 * @param callback
 *
 * Example usage
 * -------------
 * detectSpeed.startSpeedCheck ('http://myURl',function callback(timings){...});
 *
 * The timing data is returned as follows:
 *
 *      timings: {
 *          "start":        //start time in milliseconds
 *          "end":          //end time in milliseconds
 *          "firstByte":    //Time the first byte was received
 *          "url":          //URL that was used for testing
 *          "dataSizeKB":   //Size of the data in *bytes*
 *          "latency":      //Latency (connection round trip time) in milliseconds
 *          "throughput":   //in KBPS
 *          "throughPutSpeedClass":   //one of the constants shown below.
 *          "latencySpeedClass":   //one of the constants shown below.
 *      }
 *
 *
 * the utility also contains the following constants
 * 	    "SPEED_OFFLINE": {
 * 	        "name": "offline",
 * 	        "latency": Number.POSITIVE_INFINITY,
 * 	        "throughput": 0
 * 	    },
 *	    "DIAL_UP": {
 *       	name: 'DAIL_UP',
 *       	latency: 2000,
 *       	throughput: 2.4
 *   	    },
 * 	    "SPEED_GPRS": {
 * 	        "name": "GPRS",
 * 	        "latency": 500,
 * 	        "throughput": 50
 * 	    },
 * 	    "SPEED_2G": {
 * 	        "name": "2G",
 * 	        "latency": 300,
 * 	        "throughput": 250
 * 	    },
 * 	    "SPEED_2G_EDGE": {
 * 	        "name": "2G_EDGE",
 * 	        "latency": 300,
 * 	        "throughput": 450
 * 	    },
 * 	    "SPEED_3G": {
 * 	        "name": "3G",
 * 	        "latency": 200,
 * 	        "throughput": 750
 * 	    },
 * 	    "SPEED_3G_HSPA": {
 * 	        "name": "3G_HSPA",
 * 	        "latency": 200,
 * 	        "throughput": 1000
 * 	    },
 * 	    "SPEED_4G": {
 * 	        "name": "4G",
 * 	        "latency": 100,
 * 	        "throughput": 4000
 * 	    },
 * 	    "SPEED_WIFI": {
 * 	        "name": "WIFI",
 * 	        "latency": 100 ,
 * 	        "throughput": 10000
 * 	    }
 ************************************/
(function () {
    //Speed definitions derived from ...
    //@http://kenstechtips.com/index.php/download-speeds-2g-3g-and-4g-actual-meaning
    var detectSpeed = {}
    var speedClasses = [{
        name: 'OFFLINE',
        latency: Number.POSITIVE_INFINITY,
        throughput: 0
    },{
        name: 'DAIL_UP',
        latency: 2000,
        throughput: 2.4 
    },{
        name: 'GPRS',
        latency: 500,
        throughput: 50
    }, {
        name: '2G',
        latency: 300,
        throughput: 250
    }, {
        name: '2G_EDGE',
        latency: 300,
        throughput: 450
    }, {
        name: '3G',
        latency: 200,
        throughput: 750
    }, {
        name: '3G_HSPA',
        latency: 200,
        throughput: 1000
    }, {
        name: '4G',
        latency: 100,
        throughput: 4000
    }, {
        name: 'WIFI',
        latency: 100,
        throughput: 10000
    }
    ];

    var getRandomString = function( sizeInMb ) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+`-=[]\{}|;':,./<>?", //random data prevents gzip effect
            iterations = sizeInMb * 1024 * 1024, //get byte count
            result = '';
        for( var index = 0; index < iterations; index++ ) {
            result += chars.charAt( Math.floor( Math.random() * chars.length ) );
        };     
        return result;
    };

    for (var s = 0; s < speedClasses.length; s++) {
        detectSpeed["SPEED_" + speedClasses[s].name] = speedClasses[s];
    }

    root = this;
    if (root != null) {
        previous_detectSpeed = root.detectSpeed;
    }

    detectSpeed.noConflict = function () {
        root.detectSpeed = previous_detectSpeed;
        return detectSpeed;
    };
    detectSpeed.startSpeedCheck = function (earl, callback) {
        var earl = earl || "https://" + location.host + "/img/login_img-1.jpg";
        earl = earl + (/\?/.test(earl) ? "&" : "?") + "cacheBuster=" + Date.now();
        var _timings = {};
        var _progress = function (e) {
            _timings.firstByte = _timings.firstByte || Date.now();
//            console.log("P");
            oReq.removeEventListener("progress", _progress, false);
        };
        var _done = function (data) {
            var size = data.target.response.length;
            _timings.url = earl;
            _timings.dataSizeKB = size / 1000;
            _timings.end = Date.now();
            _timings.latency = (_timings.firstByte - _timings.start);
            _timings.throughput = Math.round(size / (_timings.end - _timings.firstByte) * 100) / 100; //in KBPS
            for (var s = 0; s < speedClasses.length; s++) {
                if(_timings.throughput > speedClasses[s].throughput){
                    _timings.throughPutSpeedClass = speedClasses[s];
                }
                if(_timings.latency <speedClasses[s].latency){
                    _timings.latencySpeedClass = speedClasses[s];
                }
            }
            
            var xhr = new XMLHttpRequest(),
                url = "https://" + location.host + "/check?cache=" + Math.floor( Math.random() * 10000 ), //prevent url cache
                data = getRandomString( 1 ), //1 meg POST size handled by all servers
                startTime,
                speed = 0;
            xhr.onreadystatechange = function ( event ) {
                if( xhr.readyState == 4 ) {
                    speed = Math.round( 1024 / ( ( new Date() - startTime ) / 1000 ) );
                    _timings.uploadBandwidth = speed;
                    callback && callback(_timings);
                };
            };
            xhr.open( 'POST', url, true );
            startTime = new Date();
            xhr.send( data );
        };
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("progress", _progress, false);
        oReq.onload = _done;
        _timings.start = Date.now();
        oReq.open("GET", earl);
        oReq.send();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = detectSpeed;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return detectSpeed;
        });
    }
    // included directly via <script> tag
    else {
        root.detectSpeed = detectSpeed;
    }
})();
