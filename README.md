srlplayer
=========

#### Description
Rewrite of [srlplayer](https://github.com/tadachi/srlplayer) . It will reference streams on SRL, Twitch, Hitbox, and Azubu.

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

For me, I would enter http://sa.tak.com:4001 into my browser to use/test the app. You would use another host name or try http://localhost:4001 .
