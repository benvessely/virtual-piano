const noteNames = [
    "c4"
];


// Code below to check to make sure DOM content loaded before adding event listeners.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ready()
    });
} else {
    ready();
}


function ready() { 
    // const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
    // c4Audio.load();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // let loadedMetaData = false; 
    const audioBuffers = CreateAudioBuffers(audioContext); 
    // DB below 
    audioBuffers.then((data) => { 
        console.log(`Testing audioBuffers promise, we have data = ${data}`); 
    }); //
    const audioPlayer = GenerateAudioPlayer(audioBuffers, audioContext); 
    audioPlayer.createPrimaryGain(.50);  
    audioPlayer.c4NoteCreation(); 

    // Adds event listeners to buttons 
    var pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (var i = 0; i < pianoKeys.length; i++) {
        var button = pianoKeys[i];
        button.addEventListener('mousedown', () => { 
            audioPlayer.playNote(); 
            // Testing code below 
            // const c4Source = audioContext.createBufferSource(); 
            // c4Source.buffer = audioBuffers[0]; 
            // c4Source.connect(primaryGainControl); 
            // c4Source.start(); 
            // setTimeout(() => c4Source.stop(), 2000); 
            console.log("At end of mousedown event body"); //DB
        });
    }
} 


function GenerateAudioPlayer(audioBuffers, audioContext) {
    const audioPlayer = { 
        APAudioBuffers: audioBuffers, 
        APAudioContext: audioContext, 
        createPrimaryGain: function(gainValue) { 
            this.primaryGainControl = this.APAudioContext.createGain(); 
            this.primaryGainControl.gain.setValueAtTime(gainValue, 0); 
            this.primaryGainControl.connect(audioContext.destination); 
            console.log("At end of createPrimaryGain body"); //DB 
        },
        c4NoteCreation: function() {
            console.log(`this.APAudioBuffers[0] = ${this.APAudioBuffers[0]} at the start of c4NoteCreation`); 
            this.c4Source = this.APAudioContext.createBufferSource();
            this.c4Source.buffer = this.APAudioBuffers[0]; 
            this.c4Source.connect(this.primaryGainControl);
        },
        playNote: function() { 
            console.log(`this.c4Source = ${this.c4Source} at the start of playNote`); //DB 
            this.c4Source.start(); 
            setTimeout(() => this.c4Source.stop(), 2000); 
            console.log("We are at end of in the playNote body"); //DB
            // Testing code below 
            // const c4Source = this.APAudioContext.createBufferSource(); 
            // c4Source.buffer = this.APAudioBuffers[0]; 
            // c4Source.connect(this.primaryGainControl); 
            // c4Source.start(); 
            // setTimeout(() => c4Source.stop(), 2000); 
        }
    }
    return audioPlayer
}


// Creates the AudioBuffers from the mp3 Files, one for every note in array noteNames
async function CreateAudioBuffers(audioContext) { 
    // Array to hold all of the arrayBuffers
    const returnArray = [];
    try { 
        const response = await fetch('sounds/c4-virtual-piano.mp3');
        const newArrayBuffer = await response.arrayBuffer();
        const newAudioBuffer = await audioContext.decodeAudioData(newArrayBuffer);
        returnArray.push(newAudioBuffer);
    } catch(error) { 
        console.error(error); 
        return; 
    } 
    
    return returnArray;

    // Code to create buffer 
    // const c4Buffer = audioContext.createBuffer(
    //     1,
    //     audioContext.sampleRate * c4Audio.duration,
    //     audioContext.sampleRate
    // ); 
}


function handleNoteClick() { 
    console.log("in handleNoteClick"); 
}



