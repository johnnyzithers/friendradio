var bass = require('bassaudio'); 
var basslib = new bass();
 
 //get all sound cards 
 var cards = basslib.getDevices();
 console.log('total found sound cards:' + cards.length)
 //lets print first sound card's info, find out more inside source code.. 
 //first item in array '[0]' is "no sound" , then use the item [1] 
 //you will see that card isInitialized will be false, because we did not init it yet.. 
 var card = cards[1];
 console.log(card.name + ' is enabled:' + card.enabled + ' ,IsDefault:' + card.IsDefault + ' , IsInitialized:' + card.IsInitialized + ' ,typeSpeakers:' + card.typeSpeakers)
 

// [device],[freq],[flags] , -1 is default sound card 
var result = basslib.BASS_Init(-1,44100,basslib.BASS_Initflags.BASS_DEVICE_STEREO)
if(!result){
  console.log('error init sound card:' + basslib.BASS_ErrorGetCode())
}
 
console.log("first card is init?: " + basslib.getDevice(1).IsInitialized)
 
// // isMemoryFile,filename,offset,length,flags, returns pointer of file 
// var chan = basslib.BASS_StreamCreateFile(0,'./data/test.mp3',0,0,0)
// if(basslib.BASS_ErrorGetCode()!=basslib.BASS_ErrorCode.BASS_OK){
//   console.log('error opening file:' + basslib.BASS_ErrorGetCode())
// }
 



// use mixer as a trick, because if the channel freed or added new channel, the encoder stops itself.
// add channels to mixer every time, and add mixer channel to encoder. so the encoder never stops..
// enable mixer before using it!
basslib.EnableMixer(true);
console.log("mixer is enabled?: ", basslib.MixerEnabled());

var mixer=basslib.BASS_Mixer_StreamCreate(44100, 2,basslib.BASSFlags.BASS_SAMPLE_FLOAT);
var chan=basslib.BASS_StreamCreateFile(0,'./web/test.wav',0,0,basslib.BASSFlags.BASS_STREAM_DECODE | basslib.BASSFlags.BASS_SAMPLE_FLOAT)
var ok = basslib.BASS_Mixer_StreamAddChannel(mixer, chan, basslib.BASSFlags.BASS_SAMPLE_DEFAULT);
 
basslib.EnableEncoder(true);
 
// lets try icecast 
// var enc_chan = basslib.BASS_Encode_Start(mixer,'lame -r -m s -s 22050 -b 56 -',basslib.BASS_Encode_Startflags.BASS_ENCODE_NOHEAD);
var enc_chan = basslib.BASS_Encode_Start(mixer,'lame -r -m s -',basslib.BASS_Encode_Startflags.BASS_ENCODE_FP_16BIT);
var result = basslib.BASS_Encode_CastInit(enc_chan,
                                     'http://localhost:9000/stream',
                                     'hackme',
                                     basslib.BASS_Encode_CastInitcontentMIMEtypes.BASS_ENCODE_TYPE_MP3,
                                     '', //name
                                     '', //url
                                     '', //genre
                                     '', //desc
                                     '',
                                     44100,
                                     true //public 
                                     );

 console.log("stream error?: " + basslib.BASS_ErrorGetCode()); // 0 is ok, 2 is fileopen



// basslib.BASS_ChannelPlay(mixer,0); 
// 	basslib.BASS_ChannelPlay(mixer,0);    


//lets play 
//channel,restart   , returns  (also there are stop , pause commands)  
var success = basslib.BASS_ChannelPlay(mixer,-1)
if(!success){ 
  console.log('error playing file:' + basslib.BASS_ErrorGetCode())
}

// var result=basslib.BASS_Encode_SetNotify(enc_chan,function(handle,status,user){
//   if(status==basslib.EncoderNotifyStatus.BASS_ENCODE_NOTIFY_CAST){
//   console.log('server connection is dead');
// }});

// //lets make a callback when position reaches to 20. seconds.
// var Pos20SecondsBytePos=basslib.BASS_ChannelSeconds2Bytes(chan,20);
// var proc20SecondsID=basslib.BASS_ChannelSetSync(chan,basslib.BASS_ChannelSyncTypes.BASS_SYNC_POS,Pos20SecondsBytePos,function(handle,channel,data,user){
//    if(handle==proc20SecondsID){ 
//       console.log('position reached to the 20 seconds..')
//    }
// })

// //lets get the event when the position reaches to end
// var procTOENDID=basslib.BASS_ChannelSetSync(chan,basslib.BASS_ChannelSyncTypes.BASS_SYNC_END,0,function(handle,channel,data,user){
//    if(handle==procTOENDID){ 
//       console.log('playback finished..')
//    }
// })


// //if stream is active (playing), then get position and duration.. 
setInterval(function(){

    if(basslib.BASS_ChannelIsActive(chan)==basslib.BASS_ChannelIsActiveAttribs.BASS_ACTIVE_PLAYING) {
 
  //       var position = basslib.BASS_ChannelBytes2Seconds(chan, basslib.BASS_ChannelGetPosition(chan, 0));
  //       var duration = basslib.BASS_ChannelBytes2Seconds(chan, basslib.BASS_ChannelGetLength(chan, 0))
		// var info = basslib.BASS_ChannelGetInfo(chan);

  //       console.log(position + ' / ' + duration, '-- "',info.filename,'"--');
    }else{
        console.log('stopped');
    }
},500)





