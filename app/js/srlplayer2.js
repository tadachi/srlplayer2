/*
* Similar to what you find in Java"s format.
* Usage: chatsrc = "http://twitch.tv/chat/embed?channel={channel}&amp;popout_chat=true".format({ channel: streamer});
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

/*
* Parses the URL for querystring params.
* Example usage:
*   url = "http://dummy.com/?technology=jquery&blog=jquerybyexample".
*   var tech = getQueryStringParams("technology"); //outputs: "jquery"
*   var blog = getQueryStringParams("blog");       //outputs: "jquerybyexample"
*/
function getQueryStringParams(sParam) {
	var sPageURL      = window.location.href;
	var sURLVariables = sPageURL.split("/");
	var querystring;
	var count         = 0;
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
	$scope.data0 = null;
	$scope.data1 = null;
	$scope.data2 = null;
	$scope.data3 = null;
	$scope.data4 = null;
	$scope.data5 = null;
	$scope.data6 = null;
	$scope.data7 = null;

	$scope.category = "Speedruns" //Default starts on Speedruns

	/* Populate stream selector tables */
	//$scope.categories = ["Speedruns", "Starcraft", "Hearthstone", "Dota", "Counterstrike", "Hitbox", "Azubu", "Followed"];
	$scope.categories = ["Speedruns", "Starcraft", "Hitbox", "Hearthstone", "Dota", "Counterstrike", "LeagueOfLegends", "Followed"];
	$scope.selection = $scope.categories[0]; // Default

	$scope.urls = [ // List of REST api calls with all the streams we want.
		"http://api.takbytes.com/speedruns",
		"http://api.takbytes.com/starcraft",
		"http://api.takbytes.com/hearthstone",
		"http://api.takbytes.com/dota",
		"http://api.takbytes.com/counterstrike",
		"http://api.takbytes.com/hitbox",
		"http://api.takbytes.com/league"
	];
	
	$scope.refreshStreams = function() {
		$http.get($scope.urls[0]).success(function(data) { console.log(data); $scope.data0 = angular.fromJson(data); }); // Data returned is JSON. Convert it to Array Object for populating our stream list.
		$http.get($scope.urls[1]).success(function(data) { console.log(data); $scope.data1 = angular.fromJson(data); });
		$http.get($scope.urls[2]).success(function(data) { console.log(data); $scope.data2 = angular.fromJson(data); });
		$http.get($scope.urls[3]).success(function(data) { console.log(data); $scope.data3 = angular.fromJson(data); });
		$http.get($scope.urls[4]).success(function(data) { console.log(data); $scope.data4 = angular.fromJson(data); });
		$http.get($scope.urls[5]).success(function(data) { console.log(data); $scope.data5 = angular.fromJson(data); });
		$http.get($scope.urls[6]).success(function(data) { console.log(data); $scope.data6 = angular.fromJson(data); });
		// $http.get($scope.urls[5]).success(function(data) { $scope.data5 = angular.fromJson(data); console.log(angular.fromJson(data));} ); //console.log(angular.fromJson(data));
		if (localStorage.getItem("twitch-username")) { loadStreams(function(data) { console.log(data.clean(null)); $scope.data7 = data.clean(null);  } ); }// console.log(data.clean(null));
		console.log("REFRESHED");
	}


	
	function loadStreams(callback) {
		twitch_username = localStorage.getItem("twitch-username"); // Used for getting all streams that twitch user follows

		getAllFollowedStreams(twitch_username, function(results) {
			callback(results);
			console.log("LOADSTREAMS");
		});
	}

	function getAllFollowedStreams(name, callback) {
		var offset     = 0; // get the next 25 people if you follow more than 25 people so increase offset by 25.
		var limit      = 200;
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

	/* Reinjects HTML with the twitch embed pointing to the stream. */
	$scope.reloadTwitchVideoPlayer = function(streamername) {
		center = calcCenter();

		// Create the channel string based on chosen stream.
		flashvars = "channel={CHANNEL}&auto_play=true".format({
			CHANNEL: streamername});

		html =    ["<object bgcolor='#000000'",
						"id='video'",
						"data='http://www.twitch.tv/widgets/archive_embed_player.swf'",
						"type='application/x-shockwave-flash'",
						"width='{w}'".format({ w: center.w }),
						"height='{h}'>".format({ h: center.h }),
						"<param name='movie' value='http://www.twitch.tv/widgets/archive_embed_player.swf' />",
						"<param name='allowScriptAccess' value='sameDomain' />",
						"<param name='allowNetworking' value='all' />",
						"<param name='allowFullScreen' value='true' />",
						"<param name='flashvars' value='{flashvars}'/>".format({flashvars: flashvars}),
						
					"</object>"
					].join("");

		$("#center").html(html);
	}

	$scope.reloadTwitchChat = function(streamername) {
		right = calcRight();

		// Change the chat to the corresponding video channel.
		src = 'http://twitch.tv/chat/embed?channel={ch}&amp;popout_chat=true'.format({
			ch: streamername});

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

	/* Reinjects HTML with the hitbox embed pointing to the stream. */
	$scope.reloadHitboxVideoPlayer = function(streamername) {
		center = calcCenter();

		// Create the channel string based on chosen stream.
		flashvars = "channel={CHANNEL}&auto_play=true".format({
			CHANNEL: streamername});

		html =    ["<iframe width='{w}' ".format({ w: center.w }),
						"height='{h}' ".format({ h: center.h }),
						"id='video'",
						"src='http://hitbox.tv/#!/embed/{CHANNELNAME}?autoplay=true' ".format({ CHANNELNAME: streamername }),
						"frameborder='0' ",
						"allowfullscreen",
						">",
					"</iframe>"
					].join("");

		$("#center").html(html);
	}

	$scope.reloadHitboxChat = function(streamername) {
		right = calcRight();

		html =  ["<iframe width='{w}' ".format({ w: right.w }),
					"id='chat'",
					"height='{h}' ".format({ h: right.h }),
					"src='http://hitbox.tv/embedchat/{CHANNELNAME}' ".format({ CHANNELNAME: streamername }),
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

	/* AngularJS Main */
	$scope.refreshStreams();

	
	$interval(function(){
		$scope.refreshStreams();
		//$scope.loadStreams();
		loadStreams();
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

/* Resolutions */
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


/* Resize */
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

var leftShow = true;
var rightShow = true;

/* JQuery Main */
$( window ).resize(function() {
	applyResolutions();
});

$( document ).ready(function() {
	applyResolutions();

	/*** Manage settings with session/localstorage ***/
	$("#settings").click(function() { //Show the settingsmenu div on click.
		$("#settings-menu").toggle();
	})
	
	if( localStorage.getItem("twitch-username") ) {
		$("#twitch-username").val(localStorage.getItem("twitch-username"));
		$("#show-followed-twitch-streams").prop("checked", true); // Checkbox is checked.
		$("#twitch-username").prop("disabled",true); // Disable textbox.
	}

	$("#show-followed-twitch-streams").click(function() { // Toggle show followers on list of streamers.
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
});
