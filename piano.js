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

function handleNoteClick(targetButton) { 
    // TODO 
}