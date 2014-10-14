/*
* Similar to what you find in Java's format.
* Usage: chatsrc = 'http://twitch.tv/chat/embed?channel={channel}&amp;popout_chat=true'.format({ channel: streamer});
*/
if (!String.prototype.format) {
	String.prototype.format = function() {
		var str = this.toString();
		if (!arguments.length)
			return str;
		var args = typeof arguments[0],
			args = (('string' == args || 'number' == args) ? arguments : arguments[0]);
		for (arg in args)
			str = str.replace(RegExp('\\{' + arg + '\\}', 'gi'), args[arg]);
		return str;
	}
}

/*
* Parses the URL for querystring params.
* Example usage:
*   url = "http://dummy.com/?technology=jquery&blog=jquerybyexample".
*   var tech = getQueryStringParams('technology'); //outputs: 'jquery'
*   var blog = getQueryStringParams('blog');       //outputs: 'jquerybyexample'
*/
function getQueryStringParams(sParam) {
	var sPageURL      = window.location.href;
	var sURLVariables = sPageURL.split('/');
	var querystring;
	var count         = 0;
	var key;
	var value;

	for (i = 0; i < sURLVariables.length; i++) {
		if (sURLVariables[i].substring(0, 1) == '?') { // Found query string.
			querystring = sURLVariables[i].substring(1).split('&');
		}
	}

	if (querystring) {
		for (i = 0; i < querystring.length; i++) {
			arr = querystring[i].split('=');
			key = arr[0];
			value = arr[1];
			if (key == sParam) { // key mataches param.
				return value;    // Return match.
			}
		}
	}

	return null;
}

var app = angular.module('srlplayer2', []);

app.controller('MainController', function($scope, $http, $location) {
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
	$scope.categories = ['Speedruns', 'Starcraft', 'Hearthstone', 'Dota', 'Counterstrike', 'Hitbox', 'Azubu', 'Followed'];
	$scope.selection = $scope.categories[0]; // Default

	$scope.urls = [ // List of REST api calls with all the streams we want.
		'http://sa.tak.com:4001/speedruns?callback=JSON_CALLBACK',
		'http://sa.tak.com:4001/starcraft?callback=JSON_CALLBACK',
		'http://sa.tak.com:4001/hearthstone?callback=JSON_CALLBACK',
		'http://sa.tak.com:4001/dota?callback=JSON_CALLBACK',
		'http://sa.tak.com:4001/counterstrike?callback=JSON_CALLBACK',
		'http://sa.tak.com:4001/hitbox?callback=JSON_CALLBACK'
	];

	$scope.refreshStreams = function() {
		$http.get($scope.urls[0]).success(function(data) { $scope.data0 = angular.fromJson(data); } ); // Data returned is JSON. Convert it to Array Object for populating our stream list.
		$http.get($scope.urls[1]).success(function(data) { $scope.data1 = angular.fromJson(data); } );
		$http.get($scope.urls[2]).success(function(data) { $scope.data2 = data} );
		$http.get($scope.urls[3]).success(function(data) { $scope.data3 = data} );
		$http.get($scope.urls[4]).success(function(data) { $scope.data4 = data} );
		$http.get($scope.urls[5]).success(function(data) { $scope.data5 = angular.fromJson(data); console.log(angular.fromJson(data)); } );
	}


	function loadStreams(callback) {
		twitchusername = ''; // Used for getting all streams that twitch user follows
		if (localStorage.getItem('twitchusername')) {
			twitchusername = localStorage.getItem('twitchusername')
		}

		getAllFollowedStreams(twitchusername, function(results) {
			callback(null, results);
		});
	}

	function getAllFollowedStreams(name, callback) {
		var offset     = 0; // get the next 25 people if you follow more than 25 people so increase offset by 25.
		var limit      = 200;
		$.ajax({
			url: 'https://api.twitch.tv/kraken/users/{name}/follows/channels?direction =DESC&limit={limit}&offset={offset}&sortby=created_at'.format({ name: name, limit: limit, offset: offset }),
			jsonp: 'callback',
			dataType: 'jsonp', // tell jQuery we're expecting JSONP.

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

		// Array of streams to see if online.
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
			url      : 'https://api.twitch.tv/kraken/streams/' + streamname,

			jsonp    : 'callback',

			dataType : 'jsonp', // tell jQuery we're expecting JSONP.

			success: function(stream) { // work with the response.
				//console.log(stream);
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
		flashvars = 'channel={CHANNEL}&auto_play=true'.format({
			CHANNEL: streamername});

		html =    ["<object bgcolor='#000000'",
						"data='http://www.twitch.tv/widgets/archive_embed_player.swf'",
						"type='application/x-shockwave-flash'",
						"width='{w}'".format({ w: center.w }),
						"height='{h}'>".format({ h: center.h }),
						"<param name='movie' value='http://www.twitch.tv/widgets/archive_embed_player.swf' />",
						"<param name='allowScriptAccess' value='always' />",
						"<param name='allowNetworking' value='all' />",
						"<param name='allowFullScreen' value='true' />",
						"<param name='flashvars' value='{flashvars}'/>".format({flashvars: flashvars}),
					"</object>"
					].join('');

		//$("#center").html(html);
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
					'</iframe>'].join('');

		//$('#right').html(html);
	}

	/* Reinjects HTML with the hitbox embed pointing to the stream. */
	$scope.reloadHitboxVideoPlayer = function(streamername) {
		center = calcCenter();

		// Create the channel string based on chosen stream.
		flashvars = 'channel={CHANNEL}&auto_play=true'.format({
			CHANNEL: streamername});

		html =    ["<iframe width='{w}' ".format({ w: center.w }),
						"height='{h}' ".format({ h: center.h }),
						"src='http://hitbox.tv/#!/embed/{CHANNELNAME}?autoplay=true' ".format({ CHANNELNAME: streamername }),
						"frameborder='0' ",
						"allowfullscreen",
						">",
					"</iframe>"
					].join('');

		$("#center").html(html);
	}

	$scope.reloadHitboxChat = function(streamername) {
		right = calcRight();

		html =  ["<iframe width='{w}' ".format({ w: right.w }),
					"height='{h}' ".format({ h: right.h }),
					"src='http://hitbox.tv/embedchat/{CHANNELNAME}' ".format({ CHANNELNAME: streamername }),
					"frameborder='0' ",
					"allowfullscreen",
					">",
				"</iframe>"
				].join('');

		$('#right').html(html);
	}

	/* Events */
	/* Catch ngRepeatFinished emitted event and parse for links in stream description and linkify it. */
	$scope.$on("ngRepeatFinished", function(ngRepeatFinishedEvent) {
		$('.description').linkify();
	});

	/* Main */
	$scope.refreshStreams();
});

// Emit an event when ngRepeat finishes rendering.
app.directive("onFinishRender", function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if (scope.$last === true) {
				$timeout(function () {
					scope.$emit('ngRepeatFinished');
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

	width          = 307;
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

	$('#container').css('width', container.w);
	$('#container').css('height', container.h);
	$('#header').css('width', header.w);
	$('#header').css('height', header.h);
	$('#center').css('width', container.w - left.w - right.w);
	$('#center').css('height', center.h);
	$('#right').css('width', right.w);
	$('#right').css('height', right.h);
	$('#left').css('width', left.w);
	$('#left').css('height', left.h);

	$('#settings-menu').css('width', left.w);
	$('#settings-menu').css('height', 500);
	$('#settings-menu').css('margin-top', header.h);

}

var leftShow = true;
var rightShow = true;

$( window ).resize(function() {
	applyResolutions();
});

$( document ).ready(function() {
	applyResolutions();

	$('#settings').click(function() { //Show the settingsmenu div on click.
		$('#settings-menu').toggle();
	})

});
