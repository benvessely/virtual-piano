if (document.readyState == 'loading') { 
    document.addEventListener('DOMContentLoaded', ready);
} else { 
    ready(); 
}

/* Once the DOM Content has loaded, this function runs to attach Event Listeners to piano key buttons */ 
function ready() { 
    var pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (var i=0 ; i < pianoKeys.length ; i++) { 
        var button = pianoKeys[i]; 
        button.addEventListener('click', handleNoteClick)
    };
}

/* Do I need a function for this? No idea. */ 
function createAudioContext() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext; 
} 

function handleNoteClick(targetButton) { 
    const c4Audio= new Audio('sounds/c4-virtual-piano.mp3'); 
    // c4Audio.play(); 
}