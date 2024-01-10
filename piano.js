function setUp() { 
    const c4Audio = new Audio('sounds/c4-virtual-piano.mp3');
    c4Audio.load();
    let domContentLoaded = false; 
    let loadedMetaData = false; 

    function checkReadyState() {
        if (domContentLoaded && loadedMetaData) {
            
            c4Button = document.getElementsByClassName("btn-key-white")[0]; 
            c4Button.addEventListener("click", () => { 
                c4Audio.play();
                // TODO Stop the audio or something I guess? 
            }) 
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


function handleNoteClick(targetButton) { 
    // TODO 
}


// "Main" IIFE (immediately invoked) function below I guess
(function() { 
    setUp(); 
}
)() 

