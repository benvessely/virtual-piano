const noteNames = [
    "c4"
];

// Code below to check to make sure DOM content loaded before adding event listeners.
let domContentLoaded = false; 
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        domContentLoaded = true;
        ready();
    });
} else {
    domContentLoaded = true;
    ready();
}

function ready() { 
    // const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
    // c4Audio.load();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // let loadedMetaData = false; 

    const audioBuffers = createAudioBuffers(audioContext); 

    // c4Audio.addEventListener('loadedmetadata', function () {
    //     loadedMetaData = true;
    //     checkReadyState();
    // });

    // Flag variable for our check later. 
    

    // Check to make sure page is loaded before trying to add event listeners to buttons.

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

function createAudioBuffers() { 

    // const buffer = audioContext.createBuffer(
    //     1,
    //     audioContext.sampleRate * c4Audio.duration,
    //     audioContext.sampleRate
    // );
}


function handleNoteClick(targetButton) { 
    // TODO 
}


setUp(); 


