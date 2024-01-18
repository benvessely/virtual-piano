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

function ready() { 
    // const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
    // c4Audio.load();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // let loadedMetaData = false; 

    const audioBuffers = createAudioBuffers(audioContext); 

    const primaryGainControl = audioContext.createGain(); 
    primaryGainControl.gain.setValueAtTime(.05, 0); 
    primaryGainControl.connect(audioContext.destination); 

    // c4Audio.addEventListener('loadedmetadata', function () {
    //     loadedMetaData = true;
    //     checkReadyState();
    // });

    // Adds event listeners to buttons 
    var pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (var i = 0; i < pianoKeys.length; i++) {
        var button = pianoKeys[i];
        button.addEventListener('mousedown', () => {
            // c4Audio.volume = 1; 
            // c4Audio.pause(); 
            // c4Audio.currentTime = 0; 
            // c4Audio.play(); 
        });
    }

} 


function createAudioBuffers(audioContext) { 

    // Array to hold all of the arrayBuffers
    let returnArray = [];
    // const c4AudioURL = "https://corsproxy.io/https://github.com/benvessely/virtual-piano/blob/main/sounds/c4-virtual-piano.mp;";
    // let c4ArrayBuffer; 
    const c4AudioFetch = fetch('sounds/c4-virtual-piano.mp3') 
        .then((response) => {
            c4ArrayBufferPromise = response.arrayBuffer();
            return c4ArrayBufferPromise
            // console.log(`c4ArrayBuffer = ${c4ArrayBuffer}`); //DB 
            // returnArray.push(c4ArrayBuffer);
            // console.log(`returnArray = ${returnArray}`); //DB 
            // return returnArray;
        })
        .then((c4arrayBuffer) => {
            returnArray.push(c4arrayBuffer);
        })
        .catch((error) => { 
            console.error(error); 
            return 
        })
        
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

    return returnArray;
}


function handleNoteClick(targetButton) { 
    console.log("Clicked key");
}



