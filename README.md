srlplayer2
=========

#### Description
Upgrade/Rewrite of [srlplayer](https://github.com/tadachi/srlplayer) . It will reference streams on SRL, Twitch, Hitbox, and Azubu.

License: MIT


#### Development

Install the latest version of Node.js for your OS.

Use this command in the same directory with the [package.json](https://github.com/tadachi/multitwitchchat/blob/master/package.json) file to install all the dependencies to get the node dev-server working.

```bash
npm install
```

In [dev-server.js](https://github.com/tadachi/srlplayer/blob/master/dev-server.js) file, find the code line below and change it to fit your needs. Or you can try http://localhost:4001

```javascript
...
...
var hostname = 'sa.tak.com'; // Change this to your hostname.
...
...
```

To get the server running,

```bash
node dev-server.js
...
Listening on port: 4001
hostname: sa.tak.com:4001
```

For me, since I added sa.tak.com into my host file, I can resolve to to it. I would enter http://sa.tak.com:4001 into my browser to use/test the app. You would use another host name or try http://localhost:4001.

#### Issues

Raise an issue if you see one.

#### Pull Requests

Please don't hesitate to do a pull request. On anything.
Some features/bugfixes I want to implement in the future:

###### Bugs that need to be fixed:
* Find a fix for clicking on stream and redirect window directly to twitch instead of opening a new tab.

###### Simple features to implement:
* Add setting where you can change default selected category for dropdown box.
* Use graphic buttons, dropdown boxes, better fonts instead of default HTML.
* Add a login option to twitch instead of going to http://www.twitch.tv to login and going back to srlplayer2.
* Better color scheme. I picked grey because it is easy on the eyes but it is very ugly.
* Add setting to change color scheme.
* More game categories
* open new tab to see profile of streamer that you're watching.

###### Complex features to implement:
* Alternative twitch chat client to its iframe flash-based one. (Very unlikely)
* Ability to star/favorite streams so that they appear on the top for that category for that user (Session-based and/or param-based).
