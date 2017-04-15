# friendradoio

Here are some installation instructions once you've cloned the repository. 

### Steps

Install the required node modules. 

```
$ cd friendradio
$ npm install

```

Copy the bassaudio library files corresponding do your system to the project's root directory.

```
$ 
$ cp ./bassaudio-lib/osx/8 ./
$ cp ./bassaudio-lib/raspi/* ./
$

```

Start the audio streaming icecast server.

``` 
$ icecast -c conf/icecast_lh.xml

```
And finally start the web server. 

``` 
$ node server.js

```


Please check the modules: [socket.io-file](https://github.com/rico345100/socket.io-file) and [socket.io-file-client](https://github.com/rico345100/socket.io-file-client)