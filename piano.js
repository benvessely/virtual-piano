const noteNames = [
    "c3", "cSharp3", "d3", "dSharp3", "e3", "f3", "fSharp3", "g3", "gSharp3", "a3", "aSharp3", "b3", "c4"
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
    audioPlayer.createPrimaryGain();  

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
            // console.log("At end of mousedown event body"); //DB
        });
    }
} 


function GenerateAudioPlayer(audioBuffers, audioContext) {
    const audioPlayer = { 
        audioBuffers: audioBuffers, 
        audioContext: audioContext, 
        createPrimaryGain(gainValue=1) { 
            this.primaryGainControl = this.audioContext.createGain(); 
            this.primaryGainControl.gain.setValueAtTime(gainValue, 0); 
            this.primaryGainControl.connect(audioContext.destination); 
            // console.log("At end of createPrimaryGain body"); //DB 
        },
        c4NoteCreation() {
            // console.log(`this.audioBuffers[0] = ${this.audioBuffers[0]} at the start of c4NoteCreation`); 
            c4Note = this.audioContext.createBufferSource();
            c4Note.buffer = this.audioBuffers[0]; 
            return c4Note; 
        },
        playNote() { 
            console.log(`At start of playNote`); //DB 
            const c4Note = this.c4NoteCreation(); 

            // Create gain specific to the new note that was just created
            const noteGain = this.audioContext.createGain(); 
            noteGain.gain.setValueAtTime(1, this.audioContext.currentTime); 
            c4Note.connect(noteGain); 
            noteGain.connect(this.primaryGainControl);
            c4Note.start(); 
            
            // Debug code below 
            // const releaseTime = 5; 
            // noteGain.gain.exponentialRampToValueAtTime(
            //     0.001, 
            //     this.audioContext.currentTime + releaseTime
            // );

            // Default behavior of piano is to play note for x time, then do exponential decay after that 
            setTimeout(() => { 
                // WHY DOES THIS LINE FIX THINGS??? TODO CHECK THIS 
                noteGain.gain.setValueAtTime(1, 0); 
                // releaseTime is time for noteGain to go to 0
                const releaseTime = 2; 
                noteGain.gain.exponentialRampToValueAtTime(
                    .001, 
                    this.audioContext.currentTime + releaseTime
                );
            }, 2000); 

            // console.log("We are at end of the playNote body"); //DB
            // Testing code below 
            // const c4Source = this.audioContext.createBufferSource(); 
            // c4Source.buffer = this.audioBuffers[0]; 
            // c4Source.connect(this.primaryGainControl); 
            // c4Source.start(); 
            // setTimeout(() => c4Source.stop(), 2000); 
        }
    }
    return audioPlayer
}


async function CreateAudioBuffers(audioContext) { 
    // Creates the AudioBuffers from the mp3 Files, one for every note in array noteNames
    try { 
        // console.log("At start of try block in CreateAudioBuffers"); //DB 

        // Array to hold all of the AudioBuffers 
        const returnArray = [];

        // All audio files should be fetched, converted to AudioBuffers, and added to returnArray after this loop 
        for (const element of noteNames) { 
            const soundFile = 'sounds/' + element + 'VirtualPiano.mp3'; 
            // console.log(`soundFile = ${soundFile}`); //DB 
            const response = await fetch(soundFile);
            const newArrayBuffer = await response.arrayBuffer();
            const newAudioBuffer = await audioContext.decodeAudioData(newArrayBuffer);
            returnArray.push(newAudioBuffer)
        }
        // console.log(`returnArray.length = ${returnArray.length}`); //DB 

        return returnArray;
    } 
    catch(error) { 
        console.error(error); 
        return; 
    } 
}


function handleNoteClick() { 
    console.log("in handleNoteClick"); 
}



