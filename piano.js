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


async function ready() { 
    // const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
    // c4Audio.load();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffers = await CreateAudioBuffers(audioContext);
    // console.log(`Do I have access to audioBuffers here? audioBuffers = ${audioBuffers}`); // DB 
   
    // DB below 
    // audioBuffers.then((data) => { 
    //     console.log(`Testing audioBuffers promise, we have data = ${data}`); 
    // }); //
    const audioPlayer = GenerateAudioPlayer(audioBuffers, audioContext); 
    audioPlayer.createPrimaryGain(.50);  

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
            c4Source = this.APAudioContext.createBufferSource();
            c4Source.buffer = this.APAudioBuffers[0]; 
            c4Source.connect(this.primaryGainControl);
            return c4Source; 
        },
        playNote: function() { 
            // console.log(`this.c4Source = ${this.c4Source} at the start of playNote`); //DB 
            const c4Note = this.c4NoteCreation(); 
            c4Note.start(); 
            setTimeout(() => {
                c4Note.stop();
            }, 2000); 
            console.log("We are at end of the playNote body"); //DB
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
    try { 
        console.log("At start of try block in CreateAudioBuffers"); 
        const returnArray = [];
        const response = await fetch('sounds/c4-virtual-piano.mp3');
        const newArrayBuffer = await response.arrayBuffer();
        const newAudioBuffer = await audioContext.decodeAudioData(newArrayBuffer);
        returnArray.push(newAudioBuffer);
        return returnArray;
    } catch(error) { 
        console.error(error); 
        return; 
    } 
}


function handleNoteClick() { 
    console.log("in handleNoteClick"); 
}



