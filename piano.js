// This array used to create AudioBuffers, as well as for identifying the specific button pressed. 
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
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffers = await CreateAudioBuffers(audioContext);

    const audioPlayer = GenerateAudioPlayer(audioBuffers, audioContext); 
    audioPlayer.createPrimaryGain();  

    // Adds event listeners to buttons 
    var pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (var i = 0; i < pianoKeys.length; i++) {
        var button = pianoKeys[i];
        button.addEventListener('mousedown', (event) => {  
            audioPlayer.playNote(event); 
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
        noteCreation(targetId) {
            // console.log(`this.audioBuffers[0] = ${this.audioBuffers[0]} at the start of c4NoteCreation`); //DB 
            let audioBuffersIndex; 
            switch (targetId) { 
                case "btn-key-c-low": 
                    audioBuffersIndex = noteNames.indexOf("c3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-c-sharp": 
                    audioBuffersIndex = noteNames.indexOf("cSharp3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-d": 
                    audioBuffersIndex = noteNames.indexOf("d3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-d-sharp": 
                    audioBuffersIndex = noteNames.indexOf("dSharp3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-e": 
                    audioBuffersIndex = noteNames.indexOf("e3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-f": 
                    audioBuffersIndex = noteNames.indexOf("f3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-f-sharp": 
                    audioBuffersIndex = noteNames.indexOf("fSharp3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-g": 
                    audioBuffersIndex = noteNames.indexOf("g3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-g-sharp": 
                    audioBuffersIndex = noteNames.indexOf("gSharp3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break;  
                case "btn-key-a": 
                    audioBuffersIndex = noteNames.indexOf("a3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-a-sharp": 
                    audioBuffersIndex = noteNames.indexOf("aSharp3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-b": 
                    audioBuffersIndex = noteNames.indexOf("b3"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-c-high": 
                    audioBuffersIndex = noteNames.indexOf("c4"); 
                    console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break;   
            }
            const noteSource = this.audioContext.createBufferSource();
            noteSource.buffer = this.audioBuffers[audioBuffersIndex]; 
            return noteSource; 
        },
        playNote(event) { 
            console.log(`At start of playNote`); //DB 
            // console.log(`event.target = ${event.target}`); //DB 

            // Create a new note, which depends on the id of the button on which the event was triggered. 
            const newNote = this.noteCreation(event.target.id); 

            // Create gain specific to the new note that was just created
            const noteGain = this.audioContext.createGain(); 
            noteGain.gain.setValueAtTime(1, this.audioContext.currentTime); 
            newNote.connect(noteGain); 
            noteGain.connect(this.primaryGainControl);
            newNote.start(); 

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
            }, 1000); 

            // console.log("We are at end of the playNote body"); //DD
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



