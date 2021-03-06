/************ Twitch login button logic ***********/
var twitchAccessToken = null;
// Production using production client id.
Twitch.init({clientId: 'r4ql17x8negum4p7fcxaobhzrrqrjyi'}, function(error, status) {
    if (error) {
        // error encountered while loading
        console.log(error);
    }
    if (status.authenticated) {
        // user is currently logged in
        console.log("User is logged in (http): " + status.authenticated);
        twitchAccessToken = Twitch.getToken();
        console.log("Access Token: " + twitchAccessToken)

        // Already logged in, hide button.
        $('#twitch-connect').hide()
    } else {
        console.log("User is logged in: " + status.authenticated);
    }
});
//Twitch.init({clientId: '2e025j6mqdbziwja659s3t7a3okda7y'}, function(error, status) {
//    if (error) {
//        // error encountered while loading
//        console.log(error);
//    }
//    if (status.authenticated) {
//        // user is currently logged in
//        console.log("User is logged in (https): " + status.authenticated);
//        twitchAccessToken = Twitch.getToken();
//        console.log("Access Token: " + twitchAccessToken)
//
//        // Already logged in, hide button.
//        $('#twitch-connect').hide()
//    } else {
//        console.log("User is logged in: " + status.authenticated);
//    }
//});



/**
 * Similar to what you find in Java"s format.
 * Usage: chatsrc = "https://twitch.tv/chat/embed?channel={channel}&amp;popout_chat=true".format({ channel: streamer});
 */
if (!String.prototype.format) {
	String.prototype.format = function() {
		var str = this.toString();
		if (!arguments.length)
			return str;
		var args = typeof arguments[0],
			args = (("string" == args || "number" == args) ? arguments : arguments[0]);
		for (arg in args)
			str = str.replace(RegExp('\\{' + arg + '\\}', 'gi'), args[arg]);
		return str;
	}
}

/**
 * Parses the URL for querystring params.
 * Example usage:
 * url = "http://dummy.com/?technology=jquery&blog=jquerybyexample".
 * var tech = getQueryStringParams("technology"); //outputs: "jquery"
 * var blog = getQueryStringParams("blog");       //outputs: "jquerybyexample"
 *
 * @param sParam
 * @returns {*}
 */
function getQueryStringParams(sParam) {
	var sPageURL      = window.location.href;
	var sURLVariables = sPageURL.split("/");
	var querystring = null;
	var key;
	var value;

	for (i = 0; i < sURLVariables.length; i++) {
		if (sURLVariables[i].substring(0, 1) == "?") { // Found query string.
			querystring = sURLVariables[i].substring(1).split("&");
		}
	}

	if (querystring) {
		for (i = 0; i < querystring.length; i++) {
			arr = querystring[i].split("=");
			key = arr[0];
			value = arr[1];
			if (key == sParam) { // key mataches param.
				return value;    // Return match.
			}
		}
	}

	return null;
}

/**
 * Remove empty elements from array.
 *
 * @param deleteValue
 * @returns {Array}
 */
Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {
			this.splice(i, 1);
				i--;
			}
		}
	return this;
};

var app = angular.module("srlplayer2", []);

app.controller("MainController", function($scope, $http, $location, $interval) {
    // This will hold our Json data.
	$scope.speedruns = null;
	$scope.starcraft = null;
	$scope.hearthstone = null;
	$scope.dota = null;
	$scope.counterstrike = null;
	$scope.hitbox = null;
	$scope.league = null;
	$scope.heroes = null;
    $scope.diablo = null;
    $scope.followed = null;

	// Populate stream selector tables.
	$scope.categories = ["Speedruns", "Starcraft", "Hitbox", "Hearthstone", "Dota", "Counterstrike", "LeagueOfLegends", "Heroes", "Diablo", "Followed"];

    $scope.urls = {
        speedruns: "https://api.takbytes.com/speedruns",
        starcraft: "https://api.takbytes.com/starcraft",
        hearthstone: "https://api.takbytes.com/hearthstone",
        dota: "https://api.takbytes.com/dota",
        counterstrike: "https://api.takbytes.com/counterstrike",
        hitbox: "https://api.takbytes.com/hitbox",
        league: "https://api.takbytes.com/league",
        heroes: "https://api.takbytes.com/heroes",
        diablo: "https://api.takbytes.com/diablo",
        followed: "https://api.twitch.tv/kraken/streams/followed?oauth_token={oauth_token}".format({ oauth_token: twitchAccessToken})
    };

    $scope.setDefaultCategory = function() {
        if (twitchAccessToken != null) {
            console.log("Setting default category to Followed.");
            $scope.selection = $scope.categories[9]; // Followed.
        } else {
            console.log("Setting default category to Speedruns.");
            $scope.selection = $scope.categories[0]; // Speedruns.
        }

    }

	$scope.refreshStreams = function() {
        if (twitchAccessToken != null) { // Slower legacy way of getting followed streams without oauth
            console.log("twitchAccessToken not null. Using twitchAccessToken to populate followed streams.");

            // Throws a CORS error.
            //$http.get($scope.url).success(function(data) { console.log(data); $scope.followed = angular.fromJson(data); });

            $.ajax({
                url: $scope.urls.followed,
                jsonp: "callback",
                dataType: "jsonp", // tell jQuery we're expecting JSONP.

                success: function(data) {
                    console.log(data);
                    $scope.followed = angular.fromJson(data);
                    $scope.$apply(); // Not good practice but use it anyways.
                }
            });

        } else if (localStorage.getItem("twitch-username") && twitchAccessToken == null) { // Faster way with oauth for getting followed streams.
            console.log("twitchAccessToken is null. Using Settings user name to populate user followed streams.");
            loadStreams(function(data) {
                var clean_data = []
                data.clean(null).forEach(function(o) {
                    clean_data.push(o.stream);
                });
                $scope.followed = {streams: clean_data};
                console.log({streams: data.clean(null)});
                console.log({streams: clean_data});
            });
        }
		$http.get($scope.urls.speedruns).success(function(data) {
            console.log(data);
            data = httpsifySpeedruns(data);
            console.log(data);
            $scope.speedruns = angular.fromJson(data);
        }); // Data returned is JSON. Convert it to Array Object for populating our stream list.
		$http.get($scope.urls.starcraft).success(function(data) {
            data = httpsifyTwitch(data);
            console.log(data);
            $scope.starcraft = angular.fromJson(data);
        });
		$http.get($scope.urls.hearthstone).success(function(data) { data = httpsifyTwitch(data); console.log(data); $scope.hearthstone = angular.fromJson(data); });
		$http.get($scope.urls.dota).success(function(data) { data = httpsifyTwitch(data); console.log(data);$scope.dota = angular.fromJson(data); });
		$http.get($scope.urls.counterstrike).success(function(data) { data = httpsifyTwitch(data); console.log(data);  $scope.counterstrike = angular.fromJson(data); });
		$http.get($scope.urls.hitbox).success(function(data) { data = httpsifyHitbox(data); console.log(data);  $scope.hitbox = angular.fromJson(data); });
		$http.get($scope.urls.league).success(function(data) { data = httpsifyTwitch(data); console.log(data); $scope.league = angular.fromJson(data); });
        $http.get($scope.urls.heroes).success(function(data) { data = httpsifyTwitch(data); console.log(data); $scope.heroes = angular.fromJson(data); });
        $http.get($scope.urls.diablo).success(function(data) { data = httpsifyTwitch(data); console.log(data); $scope.diablo = angular.fromJson(data); });

        function httpsifySpeedruns(data) {
            for ( var i = 0; i < data._source.channels.length; i++) {
                url = data._source.channels[i].image.size70;
                if (url) {
                    url = url.replace(/^http:\/\//i, 'https://');
                    data._source.channels[i].image.size70 = url;
                }
            }
            return data;
        }

        function httpsifyTwitch(data) {
            for ( var i = 0; i < data.streams.length; i++) {
                url = data.streams[i].channel.logo;
                if (url) {
                    url = url.replace(/^http:\/\//i, 'https://');
                    data.streams[i].channel.logo = url;
                }
            }
            return data;
        }

        function httpsifyHitbox(data) {
            for ( var i = 0; i < data.length; i++) {
                url = data[i].user_logo;
                if (url) {
                    url = url.replace(/^http:\/\//i, 'https://');
                    data[i].user_logo = url;
                }
            }
            return data;
        }

	}

	function loadStreams(callback) {
		var twitch_username = localStorage.getItem("twitch-username"); // Used for getting all streams that twitch user follows.

		getAllFollowedStreams(twitch_username, function(results) {
			callback(results);
		});
	}

    /**
     * Gets all followed streams. 1st step of series of callbacks.
     *
     * @param name
     * @param callback
     */
	function getAllFollowedStreams(name, callback) {
		var offset     = 0; // get the next 25 people if you follow more than 25 people so increase offset by 25.
		var limit      = 1000;
		$.ajax({
			url: "https://api.twitch.tv/kraken/users/{name}/follows/channels?direction=DESC&limit={limit}&offset={offset}&sortby=created_at".format({ name: name, limit: limit, offset: offset }),
			jsonp: "callback",
			dataType: "jsonp", // tell jQuery we're expecting JSONP.

			success: function(streams) {
				if(streams.follows) {
					getOnlyOnlineFollowed(streams, function(results) {
						callback( results );
					});
				}else{
					callback(null);
				}
			}
		});
	}

    /**
     * Gets all followed streams.
     * Gets only those that are online.
     * 2st step of series of callbacks.
     *
     * @param name
     * @param callback
     */
	function getOnlyOnlineFollowed(streams, callback) {
		var asyncTasks = [];

		// Array of streams to see if online. Unfortunately you have to get them one at a time.
		streams.follows.forEach(function(stream) {
				asyncTasks.push(
					function(callback) {
						isStreamOnline(stream.channel.name, function(results) {
							callback(null, results); // async.parallel needs first param to be null so that it can return null as an error.
						});
					}
				);
		});

		// async.parallel will run all tasks at the same time.
		async.parallel( asyncTasks,
		function(err, results) { // Each task will push their callbacks into an array.
			callback(results);
		});
	}

    /**
     * Gets all followed streams.
     * Gets only those that are online.
     * last step of series of callbacks.
     *
     * @param name
     * @param callback
     */
	function isStreamOnline(streamname, callback) {
		$.ajax({
			url      : "https://api.twitch.tv/kraken/streams/" + streamname,

			jsonp    : "callback",

			dataType : "jsonp", // tell jQuery we're expecting JSONP.

			success: function(stream) { // work with the response.
				if (stream.stream) {
					callback(stream);
				}else {
					callback(null);
				}
			}
		});
	}

    /**
     * Reinjects HTML with the twitch video embed pointing to the stream.
     *
     * @param streamername
     */
	$scope.reloadTwitchVideoPlayer = function(streamername) {
		center = calcCenter();

        // SpeedrunsTV example.
        flashvars = "channel={CHANNEL}&auto_play=true&start_volume=20".format({
            CHANNEL: streamername});

        html =    ["<object type='application/x-shockwave-flash'",
            "data='//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf'",
            "width='{w}'".format({ w: center.w }),
            "height='{h}'".format({ h: center.h }),
            "id='video'",
            "bgcolor='#D3D3D3'>",
            "<param name='allowFullScreen' value='true' />",
            "<param name='allowScriptAccess' value='SameDomain' />",
            "<param name='allowNetworking' value='all'>",
            "<param name='movie' value='//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf'>",
            "<param name='flashvars' value='{flashvars}'/>".format({flashvars: flashvars}),
            "</object>"
        ].join(" ");

        // Flash Example.
        //flashvars = "channel={CHANNEL}&auto_play=true&start_volume=20".format({
			//CHANNEL: streamername});
        //html =    ["<object type='application/x-shockwave-flash'",
			//			"width='{w}'".format({ w: center.w }),
			//			"height='{h}'".format({ h: center.h }),
			//			"id='video'",
			//			"data='http://www.twitch.tv/widgets/live_embed_player.swf?channel={CHANNEL}'".format({CHANNEL: streamername}),
			//			"bgcolor='#D3D3D3'>",
			//			"<param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' />",
			//			"<param name='allowFullScreen' value='true' />",
			//			"<param name='allowScriptAccess' value='always' />",
			//			"<param name='allowNetworking' value='all' />",
			//			"<param name='flashvars' value='{flashvars}'/>".format({flashvars: flashvars}),
			//		"</object>"
			//		].join(" ");

        // Iframe Embed example.
        //src = 'http://www.twitch.tv/{CHANNEL}/embed'.format({
        //    CHANNEL: streamername});
        //
        //html =    ['<iframe ',
        //            'id="video" ',
        //            'frameborder="0" ',
        //            'scrolling="no" ',
        //            'src="{src}" '.format({src: src}),
        //            'width="{w}" '.format({w: center.w}),
        //            'height="{h}"'.format({h: center.h}),
        //            '>',
        //            '</iframe>'].join("");

        // Set #center to the video embed html code.
        $("#center").html(html);
	}

    /**
     * Reinjects HTML with the twitch chat embed pointing to the stream.
     *
     * @param streamername
     */
	$scope.reloadTwitchChat = function(streamername) {
		right = calcRight();

		// Change the chat to the corresponding video channel.
		src = 'https://twitch.tv/chat/embed?channel={CHANNEL}'.format({
			CHANNEL: streamername});

		html =    ['<iframe ',
						'id="chat" ',
						'frameborder="0" ',
						'scrolling="yes" ',
						'src="{src}" '.format({src: src}),
						'width="{w}" '.format({w: right.w}),
						'height="{h}">'.format({h: right.h}),
					'</iframe>'].join("");

		$("#right").html(html);
	}

    /**
     *
     * Reinjects HTML with the hitbox embed pointing to the stream.
     *
     * @param streamername
     */
	$scope.reloadHitboxVideoPlayer = function(streamername) {
        center = calcCenter();

		// Create the channel string based on chosen stream.
		flashvars = "channel={CHANNEL}&auto_play=true".format({
			CHANNEL: streamername});

		html =    ["<iframe width='{w}' ".format({ w: center.w }),
						"height='{h}' ".format({ h: center.h }),
						"id='video'",
						"src='https://www.hitbox.tv/#!/embed/{CHANNELNAME}?autoplay=true' ".format({ CHANNELNAME: streamername }),
						"frameborder='0' ",
						"allowfullscreen",
						">",
					"</iframe>"
					].join("");

		$("#center").html(html);
	}

    /**
     * Reinjects HTML with the hitbox embed pointing to the stream.
     *
     * @param streamername
     */
	$scope.reloadHitboxChat = function(streamername) {
		right = calcRight();

		html =  ["<iframe width='{w}' ".format({ w: right.w }),
					"id='chat'",
					"height='{h}' ".format({ h: right.h }),
					"src='https://www.hitbox.tv/embedchat/{CHANNELNAME}' ".format({ CHANNELNAME: streamername }),
					"frameborder='0' ",
					"allowfullscreen",
					">",
				"</iframe>"
				].join("");

		$("#right").html(html);
	}

	/* Events */
	/* Catch ngRepeatFinished emitted event and parse for links in stream description and linkify it. */
	$scope.$on("ngRepeatFinished", function(ngRepeatFinishedEvent) {
		$(".description").linkify();
	});

	/************** AngularJS Main **************/
	$scope.refreshStreams();

	$interval(function(){
		$scope.refreshStreams();
	},120000);

	/* On Refresh */
	var streamer = getQueryStringParams("streamer");
	var api = getQueryStringParams("api");

	if(streamer) {
		if (api == "twitch") {
			$scope.reloadTwitchVideoPlayer(streamer);
			$scope.reloadTwitchChat(streamer);
		}
		if (api == "hitbox") {
			$scope.reloadHitboxVideoPlayer(streamer);
			$scope.reloadHitboxChat(streamer);
		}
	}


    $scope.setDefaultCategory();
});

// Emit an event when ngRepeat finishes rendering.
app.directive("onFinishRender", function ($timeout) {
	return {
		restrict: "A",
		link: function (scope, element, attr) {
			if (scope.$last === true) {
				$timeout(function () {
					scope.$emit("ngRepeatFinished");
				});
			}
		}
	}
});

/*****
 *
 * Resolutions
 */
function calcContainer() {
	containerWidth = $(window).width();
	containerHeight = $(window).height();

	return {
		w: containerWidth, h: containerHeight
	};
}

function calcHeader() {
	headerWidth          = $(window).width();
	headerHeight         = 45;

	return {
		w: headerWidth, h: headerHeight
	};
}

function calcCenter() {
	left = calcLeft();
	right = calcRight();
	header = calcHeader();

	centerWidth = $(window).width() - left.w - right.w;
	centerHeight = $(window).height() - header.h;

	return {
		w: centerWidth, h: centerHeight
	};
}

function calcLeft() {
	header = calcHeader();

	width          = 400;
	height         = $(window).height() - header.h;

	return {
		w: width, h: height
	};
}

function calcRight() {
	header = calcHeader();

	width          = 307;
	height         = $(window).height() - header.h;

	return {
		w: width, h: height
	};
}

function applyResolutions() {
	container = calcContainer();
	center    = calcCenter();
	left      = calcLeft();
	right     = calcRight();
	header    = calcHeader();

	$("#container").css("width", container.w);
	$("#container").css("height", container.h);
	$("#header").css("width", header.w);
	$("#header").css("height", header.h);
	$("#center").css("width", container.w - left.w - right.w);
	$("#center").css("height", center.h);
	$("#right").css("width", right.w);
	$("#right").css("height", right.h);
	$("#left").css("width", left.w);
	$("#left").css("height", left.h);

	if (leftShow && rightShow) {
		$('#right').css('width', right.w);
		$('#right').css('height', right.h);
		$('#left').css('width', left.w);
		$('#left').css('height', left.h);
	}

	$("#settings-menu").css("width", left.w);
	$("#settings-menu").css("height", 500);
	$("#settings-menu").css("margin-top", header.h);

	$('#video').css('width', container.w - left.w - right.w);
	$('#video').css('height', center.h);
	maximizeVideoPlayerResolution();

	$('#chat').css('width', right.w);
	$('#chat').css('height', right.h);
}

/*******
 * Resize video player using Resolution subroutines.
 */
function maximizeVideoPlayerResolution() {
	if (leftShow && !rightShow) { //Right is hidden so expand the videoplayer.
		$('#left').css('width', left.w);
		$('#left').css('height', left.h);
		$('#center').css('width', (center.w + right.w));
		$('#center').css('height', center.h);
		$('#video').css('width', (center.w + right.w));
		$('#video').css('height', center.h);
	}
	if (!leftShow && rightShow) { //Left is hidden so expand the videoplayer.
		$('#right').css('width', right.w);
		$('#right').css('height', right.h);
		$('#center').css('width', (center.w + left.w));
		$('#center').css('height', center.h);
		$('#video').css('width', (center.w + left.w));
		$('#video').css('height', center.h);
	}
	if ( (!leftShow && !rightShow) ) { //Both left and right are hidden so maximize videoplayer.
		$('#center').css('width', (center.w + left.w + right.w));
		$('#center').css('height', center.h);
		$('#video').css('width', (center.w + left.w + right.w));
		$('#video').css('height', center.h);
	}
}

/**
 * Toggle #left div that enumerates list of streams.
 */
function toggleLeft() {
	container = calcContainer();
	center    = calcCenter();
	left      = calcLeft();
	right     = calcRight();

	$('#left').toggle(); // Toggle show/hide
	leftShow = !leftShow; // Toggle the boolean.

	maximizeVideoPlayerResolution();

	if (leftShow && rightShow) {
		applyResolutions();
	}
}

/**
 * Toggle #left div that shows the stream chat.
 */
function toggleRight() {
	container = calcContainer();
	center    = calcCenter();
	left      = calcLeft();
	right     = calcRight();

	$('#right').toggle();
	rightShow = !rightShow;

	maximizeVideoPlayerResolution();

	if (leftShow && rightShow) {
		applyResolutions();
	}
}



/*****
 * JQuery Main
 *
 *****/

// By default show the left and right divs.
var leftShow = true;
var rightShow = true;
$( document ).ready(function() {
	applyResolutions();

    $( window ).resize(function() {
        applyResolutions();
    });

    /************ Manage settings with session/localstorage ************/
    $("#settings").click(function() { //Show the settingsmenu div on click.
        $("#settings-menu").toggle();
    })

    // Use twitchAccessToken if not null over hardcoded username in settings.
    if (twitchAccessToken != null) {
        if( localStorage.getItem("twitch-username") ) {

            $("#twitch-username").val(localStorage.getItem("twitch-username"));
            $("#show-followed-twitch-streams").prop("checked", true); // Checkbox is checked.
            $("#twitch-username").prop("disabled", true); // Disable textbox.
        }
    }

    // Toggle show followers on list of streamers to gray it out.
    $("#show-followed-twitch-streams").click(function() {
        if ($(this).is(":checked")) {
            localStorage.setItem("twitch-username", $("#twitch-username").val());
            $("#twitch-username").prop("disabled",true); // Disable textbox.
        }else {
            $("#twitch-username").prop("disabled",false); // Enable textbox.
            localStorage.removeItem("twitch-username");
        }
    });

    $("#apply").click(function() { //Refresh after applying settings.
        location.reload();
    });

    // Twitch stuff.
    $('.twitch-connect').click(function() {
        Twitch.login({
            scope: ['user_read', 'channel_read']
        });
    })
});
