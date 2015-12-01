/*
 * Module Dependencies
 */
var express = require('express');
var app = express();
var routes = require('./routes');
var path = require('path');
var twitter = require('ntwitter');
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var _ = require('underscore');
var cluster = require("cluster");
var sentiment = require('sentiment');

var mysql = require("mysql");
var cd = mysql.createConnection( {
	host: '',
	user: '',
	password: '',
	port : '',
	database : ''
});

var keywordArray = ['the', 'sport', 'food', 'music', 'game', 'are', 'is', 'you'];
var criterial_keyword = 'game';
var current_keyword = keywordArray[4];

var sqs = require("sqs");
var queue = sqs({
	access: '',
	secret: '',
	region: ''
})

var SNSClient = require('aws-snsclient');
var auth = {
    region: '',
  	account: '',
    topic: ''
};

var Twit = require('twit');
var cityArray = [];

if(cluster.isMaster) {

	var count = 5;
	for (var i = 0; i < count; i++) {
		cluster.fork();
	}

	cluster.on('death', function(worker) {
		cluster.fork();
		console.log("a worker dies");
	});

	cd.connect();

	// for(var i = 0; i < keywordArray.length; i++) {
		// cd.query('CREATE TABLE you (profileimg VARCHAR(150), username VARCHAR(100), user VARCHAR(100), ' +
		// 	'text TEXT, latitude VARCHAR(150), longitude VARCHAR(150))', 
		// 	function(err, result) {
		// 		if(err){
		// 			console.log(err);
		// 		} else {
		// 			console.log('Table you created');
		// 		}
		// });
	// }

	// cd.query('CREATE TABLE alltweets (keyword VARCHAR(30), profileimg VARCHAR(150), username VARCHAR(100), user VARCHAR(100), ' +
	// 		'text TEXT, latitude VARCHAR(150), longitude VARCHAR(150), tweetid VARCHAR(150), createdtime VARCHAR(150))', 
	// 	function(err, result) {
	// 		if(err){
	// 			console.log(err);
	// 		} else {
	// 			console.log("Table alltweets created");
	// 		}
	// });


	// for(var i = 0; i < keywordArray.length; i++) {
		// cd.query('DROP TABLE alltweets', function(err, result) {
		// 	if(err) {
		// 		console.log(err);
		// 	} else {
		// 		console.log('alltweets Table deleted.');
		// 	}
		// });
	// }



	// cd.query("SELECT * FROM alltweets", function(err, result) {
	//   	if(err) {
	// 		throw err;
	// 	}
	//  	for(var i=0; i<result.length; i++) {
	//  		console.log(result[i]);
	//  	}
	  
	// });

	// cd.end();

	app.configure(function() {
		app.set('port', process.env.PORT || 6998);
		app.set('views', __dirname + "/views");
		app.set('view engine', 'ejs');
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(app.router);
		app.use(express.static(path.join(__dirname, 'public')));
	});


	app.configure('development', function() {
		app.use(express.errorHandler());
	});

	http.listen(app.get('port'), function() {
		console.log("Express server listening on port #" + app.get('port'));
	});

	app.get('/', routes.index);


	/*
	 * emit data from SNS to the front-end
	 */
	var client = SNSClient(auth, function(err, message) {
		if(err) throw err;
		var item = JSON.parse(message.Message);
		// console.log("heiheiheihei", item.sentiment);
		// if(item.text.toLowerCase().indexOf(current_keyword.toLowerCase()) !== -1) {
			io.sockets.emit('tweets', {
				profileimg: item.profileimg,
				username: item.username,
				user: item.user,
				text: item.text,
				sentiment: item.sentiment,
				geo: item.geo,
				latitude: item.latitude,
				longitude: item.longitude
			});
		// }
	});
	app.post('/received', client);


	/*
	 * Setup twitter keys here
	 */
	var T = new Twit({
		consumer_key: '',
	  	consumer_secret: '',
	  	access_token: '',
	  	access_token_secret: ''
	});

	/*
	 * read data from database and send to front-end
	 */
	io.sockets.on('connection', function(socket) {
		socket.on('keyword', function(data) {
			if (data.keyword == 'Worldwide') {
				T.get('trends/place', {id : 1}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if (data.keyword == 'New York') {
				T.get('trends/place', {id : 2459115}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if (data.keyword == 'Los Angeles') {
				T.get('trends/place', {id : 2442047}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if (data.keyword == 'Toronto') {
				T.get('trends/place', {id : 4118}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if (data.keyword == 'London') {
				T.get('trends/place', {id : 44418}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if (data.keyword == 'Rio de Janeiro') {
				T.get('trends/place', {id : 455825}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if (data.keyword == 'Paris') {
				T.get('trends/place', {id : 615702}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if (data.keyword == 'Tokyo') {
				T.get('trends/place', {id : 1118370}, function(err, data, response) {
					for (var i = 0; i < 10; i++) {
						cityArray[i] = data[0].trends[i].name;
					}
					io.sockets.emit('city', {
						trends: cityArray
					});
				});
			} else if( data.keyword == 'is') {
				cd.query("SELECT * FROM the LIMIT 1111", function(err, rows, field) {
					if (err) throw err;
					for (var i in rows) {
						io.sockets.emit('dbdata', {
							latitude: rows[i].latitude,
							longitude: rows[i].longitude,
							user: rows[i].user,
							text: rows[i].text
						});
					}
				}); // end cd.query
			} else if (data.keyword == 'are') {
				cd.query("SELECT * FROM the LIMIT 666", function(err, rows, field) {
					if (err) throw err;
					for (var i in rows) {
						io.sockets.emit('dbdata', {
							latitude: rows[i].latitude,
							longitude: rows[i].longitude,
							user: rows[i].user,
							text: rows[i].text
						});
					}
				}); // end cd.query
			} else if (data.keyword == 'you') {
				cd.query("SELECT * FROM the LIMIT 998", function(err, rows, field) {
					if (err) throw err;
					for (var i in rows) {
						io.sockets.emit('dbdata', {
							latitude: rows[i].latitude,
							longitude: rows[i].longitude,
							user: rows[i].user,
							text: rows[i].text
						});
					}
				}); // end cd.query
			} else {
				cd.query("SELECT * FROM " + data.keyword + " LIMIT 1000", function(err, rows, field) {
					if (err) throw err;
					for (var i in rows) {
						io.sockets.emit('dbdata', {
							latitude: rows[i].latitude,
							longitude: rows[i].longitude,
							user: rows[i].user,
							text: rows[i].text
						});
					}
				}); // end cd.query
			}
		}); // end socket.on
	}); // end io.sockets.on

	// T.get('trends/available', {}, function(err, data, response) {
	// 	console.log(data);
	// });

	// T.get('trends/place', {id : 2459115}, function(err, data, response) {
	// 	console.log(data[0].trends[1].name);
	// });

	var stream = T.stream('statuses/filter', { track: keywordArray });
	// twitInfo.stream('statuses/filter', {track: keywordArray}, function(stream) {
		stream.on('tweet', function(tweet) {
			var geo = false;
			var latitude;
			var longitude;
			if(tweet.geo !== null) {
				geo = true;
				latitude = tweet.geo.coordinates[0];
				longitude = tweet.geo.coordinates[1];
				/*
			 	* push data to SQS queue
			 	*/
				console.log("No problem!");
				queue.push('TweetsQueue', {
					profileimg: tweet.user.profile_image_url,
					username: tweet.user.name,
					user: tweet.user.screen_name,
					text: tweet.text,
					geo: geo,
					latitude: latitude,
					longitude: longitude
				});

				if(geo == true) {
					var posts = { 
						keyword: keywordArray[i],
						profileimg: tweet.user.profile_image_url, 
						username: tweet.user.name, 
						user: tweet.user.screen_name, 
						text: tweet.text,
						latitude: latitude, 
						longitude: longitude,
						tweetId: tweet.id,
						createdTime: tweet.created_at
					};
					cd.query('INSERT INTO alltweets SET ?', posts, function(err, result) {
						if(err) {
							throw err;
						}
					});
					
				}

			}
			
		});
	// });
} else {

	/*
	 * do what workers should do
	 */
	var AWS = require("aws-sdk");
	AWS.config.loadFromPath('./config.json');
	var sns = new AWS.SNS();

	var AlchemyAPI = require('alchemy-api');
	var alchemy = new AlchemyAPI('');
	var mymood;

	/*
	 * pull data from SQS queue
	 */
	queue.pull('TweetsQueue', function(message, callback) {
		
		/*
		 * pull out and delete the data in queue
		 */
		callback();
		/*
		 * sentiment analysis
		 */
		alchemy.sentiment(message.text, {}, function (err, response) {
			if (err) throw err;

			mymood = response.docSentiment;

			if (mymood !== undefined) {
				// console.log(mymood);
				var mes = { 
					profileimg: message.profileimg, 
					username: message.username, 
					user: message.user, 
					text: message.text,
					sentiment: mymood.type,
					geo: message.geo,
					latitude: message.latitude, 
					longitude: message.longitude
				};

				var params = {
					TopicArn: 'arn:aws:sns:us-east-1:363635349051:tweetsSentiment',
					Message: JSON.stringify(mes),
					Subject: 'processedData'
				};

				/*
				 * use sns to publish data to the server
				 */
				sns.publish(params, function(err, data) {
					if(err) {
						console.log(err);
					} else {
						// console.log('Send message', data.MessageId);
					}
				}); // end sns.publish

			} // end if

		}); // end alchemy
	}); // end queue

}





