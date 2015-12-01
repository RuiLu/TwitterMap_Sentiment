                                        TwitterMap_Sentiment

INTRODUCTION
============
My TwitterMap is the app that shows the coordinates of Tweets and displays the detail information of each tweets with exact geo information.
Besides, I add four more features to my TwitterMap_Sentiment app:
(1) Using AWS SQS and SNS to deal with tweets;
(2) Sentiment analysis;
(3) Implement cluster map;
(4) Show trends in different cities.

USAGE
=====
Because I use AWS SQS, SNS and worker-set, my TwitterMap app is nearly realtime. I choose "the" as the default keyword. Once there is a tweets matching the keyword and with exact geo information, a marker will appear on the map immediately. You can change the keyword and the map type. There are three map types in TwitterMap_Snetiment. First one is Scatter, second one is Heatmap and third one is Sentiment Scatter. When we select Heatmap, we can click the Cluster button to show Clustermap. The data of Heatmap and ClusterMap comes totally from the RDS.


DESIGN
======
Tweets Collection: twit->collect streamed tweets from Twitter Streaming API.

Tweets Database: RDS

Server: socket.io is used to interact with front-end, and server.js is acted as the middle man between RDS and front-end. SQS is used to store tweets into queue, workers pull tweets information out from queue and use AlchemyAPI to do sentiment analysis. Then workers uses SNS to notify master. After master receives the notification, master uses socket.io to send processed tweets information to front-end.

Front-End: Google Map API, Bootstrap, JQuery, socket.io



