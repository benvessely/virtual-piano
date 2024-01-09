function setUp() { 
    const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
    c4Audio.load();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let domContentLoaded = false; 
    let loadedMetaData = false; 

    function checkReadyState() {
        if (domContentLoaded && loadedMetaData) {
            // Both DOM content and metadata are loaded, proceed with the code
            console.log(`c4Audio.duration = ${c4Audio.duration}`); //DB
            // const buffer = audioContext.createBuffer(
            //     1,
            //     audioContext.sampleRate * c4Audio.duration,
            //     audioContext.sampleRate
            // );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            domContentLoaded = true;
            checkReadyState();
        });
    } else {
        domContentLoaded = true;
        checkReadyState();
    }

    c4Audio.addEventListener('loadedmetadata', function () {
        loadedMetaData = true;
        checkReadyState();
    });

    var pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (var i = 0; i < pianoKeys.length; i++) {
        var button = pianoKeys[i];
        button.addEventListener('click', handleNoteClick);
    }

}

// /* Do I need a function for this? No idea. */ 
// function createAudioContext() {
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     return audioContext;
// } 


function handleNoteClick(targetButton) { 
    // TODO 
}


// "Main" IIFE (immediately invoked) function below I guess
(function() { 
    setUp(); 
}
)() 

