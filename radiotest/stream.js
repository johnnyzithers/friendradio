
var bass = require('bassaudio'); 
var basslib = new bass();
 


basslib.EnableMixer(true);
var mixer=basslib.BASS_Mixer_StreamCreate(44100, 2,basslib.BASSFlags.BASS_SAMPLE_FLOAT);
var chan=basslib.BASS_StreamCreateFile(0,'./data/test.mp3',0,0,basslib.BASSFlags.BASS_STREAM_DECODE | basslib.BASSFlags.BASS_SAMPLE_FLOAT)
var ok = basslib.BASS_Mixer_StreamAddChannel(mixer, chan, basslib.BASSFlags.BASS_SAMPLE_DEFAULT);
 
bass.EnableEncoder(true);
 
//lets try icecast 
var enc_chan=basslib.BASS_Encode_Start(mixer,'lame -r -m s -s 22050 -b 56 -',bass.BASS_Encode_Startflags.BASS_ENCODE_NOHEAD);
var result=basslib.BASS_Encode_CastInit(enc_chan,
                                     'http://server-ip:8000/test',
                                     'password',
                                     bass.BASS_Encode_CastInitcontentMIMEtypes.BASS_ENCODE_TYPE_MP3,
                                     'test stream',
                                     'http://your-server-ip',
                                     'pop',
                                     'this is my new icecast test',
                                     'header1\r\nheader2\r\n',
                                     44100,
                                     true //public 
                                     );
 
basslib.BASS_ChannelPlay(mixer,0);    



