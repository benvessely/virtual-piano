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
        // Tracker variable to help with key release synchronization with audio termination
        mouseDown: false, 
        createPrimaryGain(gainValue=1) { 
            this.primaryGainControl = this.audioContext.createGain(); 
            this.primaryGainControl.gain.setValueAtTime(gainValue, 0); 
            this.primaryGainControl.connect(audioContext.destination); 
            // console.log("At end of createPrimaryGain body"); //DB 
        },
        playNote(event) { 
            console.log(`At start of playNote`); //DB 
            // console.log(`event.target = ${event.target}`); //DB 

            // Let the object know that we are playing the note, so the mouse must be down
            this.mouseDown = true; 

            // Flag to check if mouseup occurred within one second after mousedown
            let mouseUpWithinOneSecond = false;

            function handleMouseUp() {{ 
                console.log(`In the mouseup eventListener function`); //DB 
                this.mouseDown = false; 
                console.log(`At end of mouseup eventListener function, this.mouseDown = ${this.mouseDown}`); //DB 
            }}

            // When the mouse is let up, we need to know so we can handle the audio termination 
            event.target.addEventListener("mouseup", () => { 
                console.log(`In the mouseup eventListener function`); //DB 
                this.mouseDown = false; 
                console.log(`At end of mouseup eventListener function, this.mouseDown = ${this.mouseDown}`); //DB 
            });

            const noteObject = ConstructNoteObject(this.audioContext,
                this.audioBuffers, event.target.id, this.primaryGainControl); 
            noteObject.createNote();
            noteObject.createNoteGain();
            noteObject.playAudio(); 

            // Default behavior of piano is to play note for x time, then do exponential decay after that 
            setTimeout(() => { 
                // console.log("In the terminateAudio setTimeout"); //DB 
                // TODO Working on this, trying to figure out how to terminate the audio without repeating my code, i.e. using another method? 
                console.log(`In this terminateAudio setTimeout function, this.mouseDown = ${this.mouseDown}`); // DB 
                // noteObject.terminateAudio();  

                // Only terminate audio if mouse has come up 
                if (this.mouseDown === false) { 
                    console.log("In the this.mouseDown === false block"); //DB 
                    noteObject.terminateAudio(); 
                } 
                // Else if the mouse has not yet come up, add another EventListener? 
                // else { 
                //     event.target.addEventListener("mouseup", () => {
            }, 1000);
             
            console.log("We are at end of the playNote body"); //DB
        },
    }
    return audioPlayer
}


function ConstructNoteObject(audioContext, audioBuffers, targetId, primaryGainControl) { 
    const note = { 
        audioContext: audioContext, 
        audioBuffers: audioBuffers, 
        targetId: targetId, 
        primaryGainControl: primaryGainControl,
        createNote() { 
            console.log(`At the start of note method createNote()`); //DB 
            let audioBuffersIndex; 
            switch (targetId) { 
                case "btn-key-c-low": 
                    audioBuffersIndex = noteNames.indexOf("c3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-c-sharp": 
                    audioBuffersIndex = noteNames.indexOf("cSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-d": 
                    audioBuffersIndex = noteNames.indexOf("d3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-d-sharp": 
                    audioBuffersIndex = noteNames.indexOf("dSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-e": 
                    audioBuffersIndex = noteNames.indexOf("e3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-f": 
                    audioBuffersIndex = noteNames.indexOf("f3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-f-sharp": 
                    audioBuffersIndex = noteNames.indexOf("fSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-g": 
                    audioBuffersIndex = noteNames.indexOf("g3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-g-sharp": 
                    audioBuffersIndex = noteNames.indexOf("gSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break;  
                case "btn-key-a": 
                    audioBuffersIndex = noteNames.indexOf("a3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-a-sharp": 
                    audioBuffersIndex = noteNames.indexOf("aSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-b": 
                    audioBuffersIndex = noteNames.indexOf("b3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-c-high": 
                    audioBuffersIndex = noteNames.indexOf("c4"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break;   
            }
            // console.log(`At end of note method createNote(), we have audioBuffersIndex = ${audioBuffersIndex}`); //DB 
            const noteSource = this.audioContext.createBufferSource();
            noteSource.buffer = this.audioBuffers[audioBuffersIndex]; 
            // console.log(`Do we get to this point in createNote?`); //DB 
            this.noteSource = noteSource; 
        },
        createNoteGain() { 
            console.log(`At start of note method createNoteGain()`); //DB 
            // Create gain specific to the new note
            this.noteGain = this.audioContext.createGain(); 
            // console.log(`In createNoteGain, this.noteGain = ${this.noteGain}`); //DB 
            // Above confirms that we are indeed creating a GainNode object. //DB 
            this.noteGain.gain.setValueAtTime(1, this.audioContext.currentTime); 
            this.noteSource.connect(this.noteGain); 
            this.noteGain.connect(this.primaryGainControl);
        },
        playAudio () { 
            this.noteSource.start(); 
        },
        terminateAudio() { 
            console.log(`At start of note method terminateAudio()`); //DB 
            this.noteGain.gain.setValueAtTime(1, 0); 
            // releaseTime is time for noteGain to go to 0
            const releaseTime = 2; 
            this.noteGain.gain.exponentialRampToValueAtTime(
                .001, 
                this.audioContext.currentTime + releaseTime
            );
        }
    }
    return note; 
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
            // console.log(`newAudioBuffer.length = ${newAudioBuffer.length / 44100}`); //DB 
            returnArray.push(newAudioBuffer);
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



