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

// function startButton() {
//     const startButton = document.createElement('button'); 
//     startButton.setAttribute('type', 'button'); 
//     startButton.addEventListener('click', ready()); 
// }

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
        playNote: function() { 
            console.log("We are in the playNote body"); 
            const c4Source = this.APAudioContext.createBufferSource(); 
            c4Source.buffer = this.APAudioBuffers[0]; 
            c4Source.connect(this.primaryGainControl); 
            c4Source.start(); 
            setTimeout(() => c4Source.stop(), 2000); 
        }
    }
    return audioPlayer
}

function ready() { 
    // const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
    // c4Audio.load();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // let loadedMetaData = false; 
    const audioBuffers = CreateAudioBuffers(audioContext); 
    const audioPlayer = GenerateAudioPlayer(audioBuffers, audioContext); 
    audioPlayer.createPrimaryGain(.50);  

    // const primaryGainControl = audioContext.createGain(); 
    // primaryGainControl.gain.setValueAtTime(.50, 0); 
    // primaryGainControl.connect(audioContext.destination); 

    // c4Audio.addEventListener('loadedmetadata', function () {
    //     loadedMetaData = true;
    //     checkReadyState();
    // });

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


// Creates the AudioBuffers from the mp3 Files, one for every note in array noteNames
function CreateAudioBuffers(audioContext) { 
    // Array to hold all of the arrayBuffers
    let returnArray = [];
    // const c4AudioURL = "https://corsproxy.io/https://github.com/benvessely/virtual-piano/blob/main/sounds/c4-virtual-piano.mp;";
    // let c4ArrayBuffer; 
    const noteAudioFetch = fetch('sounds/c4-virtual-piano.mp3') 
        .then((response) => {
            noteArrayBufferPromise = response.arrayBuffer();
            return noteArrayBufferPromise;
        })
        // Once the .arrayBuffer() asynchronous method has resolved, the .then occurs, calling the arrow function within that pushes the arraybuffer into our larger scoped array of arraybuffers. 
        .then((newArrayBuffer) => { 
            newAudioBuffer = audioContext.decodeAudioData(newArrayBuffer);
            return newAudioBuffer;
        }) 
        .then((newAudioBuffer) => {
            returnArray.push(newAudioBuffer);
        })
        .catch((error) => { 
            console.error(error); 
            return; 
        })
    
    return returnArray;
        
    // Possibly working code below? 
    // const c4AudioURL = "https://github.com/benvessely/virtual-piano/blob/main/sounds/c4-virtual-piano.mp3";
    // const c4AudioFetch = fetch(c4AudioURL, {mode: 'no-cors'})
    //     .catch((error) => { 
    //         console.error(error); 
    //         return 
    //     })

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



