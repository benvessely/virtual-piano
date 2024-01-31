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
            // console.log(`At start of playNote`); //DB 
            // console.log(`event.target = ${event.target}`); //DB 

            // Tracker variable that says that since we are playing the note, the mouse must be down
            this.mouseDown = true; 
            // Tracker variable: since we are playing note, the mouse must be over the button. 
            this.mouseIn = true; 

            // Flag to check if mouseup occurred within one second after mousedown
            let mouseUpWithinOneSecond = false;
            // Flag to check if mouseout
            let mouseOutWithinOneSecond = false; 

            const handleMouseUp = () => { 
                console.log(`At start of handleMouseUp`); //DB 
                this.mouseDown = false; 
                // mouseUpWithinOneSecond = true; 
            }

            const handleMouseOut = () =>  {
                console.log(`At start of handleMouseOut`); //DB 
                this.mouseIn = false; 
                // mouseOutWithinOneSecond = true; 
            }

            event.target.addEventListener("mouseup", handleMouseUp); 
            event.target.addEventListener("mouseout", handleMouseOut); 

            const noteObject = ConstructNoteObject(this.audioContext,
                this.audioBuffers, event.target.id, this.primaryGainControl); 
            noteObject.createNote();
            noteObject.createNoteGain();
            noteObject.playAudio(); 

            // Default behavior of piano is to play note for x time, then do exponential decay after that 
            setTimeout(() => { 
                // console.log("In the terminateAudio setTimeout"); //DB 
                console.log(`In the terminateAudio setTimeout, this.mouseIn = ${this.mouseIn}`); //DB 

                if (this.mouseDown === false || this.mouseIn === false) { 
                    console.log("In the mouseDown and mouseIn check block"); //DB
                    noteObject.terminateAudio();
                }

                // If we have made it past one second and the user still has mouse down, then we need to make changes to what we do when the mouse does come up
                event.target.removeEventListener("mouseup", handleMouseUp);
                // Same for if mouse goes out 
                event.target.removeEventListener("mouseout", handleMouseOut);

                // Add back appropriate event listeners
                event.target.addEventListener("mouseup", () => {
                    noteObject.terminateAudio();
                })
                event.target.addEventListener("mouseout", () => { 
                    noteObject.terminateAudio();
                })
                
            }, 1000);
            
            // console.log("We are at end of the playNote body"); //DB
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
            // console.log(`At the start of note method createNote()`); //DB 
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
            // console.log(`At start of note method createNoteGain()`); //DB 
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
            const releaseTime = 1.5; 
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