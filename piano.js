// Flags to let me know when I can run my ready function 
let domContentLoaded = false; 
let loadedMetaData = false; 

if (document.readyState == 'loading') { 
    document.addEventListener('DOMContentLoaded', function() { 
        domContentLoaded = true; 
        checkEvents(); 
    });
} else { 
    domContentLoaded = true; 
}

const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
c4Audio.load();
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

c4Audio.addEventListener('loadedmetadata', function() { 
    loadedMetaData = true; 
    checkEvents(); 
})

function checkEvents() {
    if (domContentLoaded && loadedMetaData) {
        ready();
    }
}

/* Once the DOM Content has loaded, this function runs to attach Event Listeners to piano key buttons */ 
function ready() { 
    var pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (var i=0 ; i < pianoKeys.length ; i++) { 
        var button = pianoKeys[i]; 
        button.addEventListener('click', handleNoteClick)
    };
    // const c4Audio= new Audio('sounds/c4-virtual-piano.mp3'); 
    // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log(`c4Audio.duration = ${c4Audio.duration}`); 
    // const buffer = audioContext.createBuffer(
    //     1, 
    //     audioContext.sampleRate * c4Audio.duration, 
    //     audioContext.sampleRate
    // );
}

// /* Do I need a function for this? No idea. */ 
// function createAudioContext() {
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     return audioContext;
// } 




function handleNoteClick(targetButton) { 
    // TODO 
}