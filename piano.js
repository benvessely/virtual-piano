// Code below to check to make sure DOM content loaded before adding event listeners.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ready()
    });
} else {
    ready();
};


async function ready() { 
    // This array used to create AudioBuffers, as well as for identifying the specific button pressed. 
    const noteNames = [
        "c3", "cSharp3", "d3", "dSharp3", "e3", "f3", "fSharp3", "g3", "gSharp3", "a3", "aSharp3", "b3", "c4"
    ];

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffers = await CreateAudioBuffers(audioContext, noteNames);
    const audioPlayer = GenerateAudioPlayer(audioBuffers, audioContext, noteNames); 
    audioPlayer.setup(); 

    const pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (let i = 0; i < pianoKeys.length; i++) {
        const button = pianoKeys[i];
        button.addEventListener('mousedown', (mousedownEvent) => { 
            const targetId = mousedownEvent.target.id; 
            audioPlayer.playNote(mousedownEvent, targetId); 
        });
    }

    const keyMappings = {
        'a': 'btn-key-c-low',
        'w': 'btn-key-c-sharp',
        's': 'btn-key-d',
        'e': 'btn-key-d-sharp',
        'd': 'btn-key-e',
        'f': 'btn-key-f',
        't': 'btn-key-f-sharp',
        'g': 'btn-key-g',
        'y': 'btn-key-g-sharp',
        'h': 'btn-key-a',
        'u': 'btn-key-a-sharp',
        'j': 'btn-key-b',
        'k': 'btn-key-c-high',
        'A': 'btn-key-c-low',
        'W': 'btn-key-c-sharp',
        'S': 'btn-key-d',
        'E': 'btn-key-d-sharp',
        'D': 'btn-key-e',
        'F': 'btn-key-f',
        'T': 'btn-key-f-sharp',
        'G': 'btn-key-g',
        'Y': 'btn-key-g-sharp',
        'H': 'btn-key-a',
        'U': 'btn-key-a-sharp',
        'J': 'btn-key-b',
        'K': 'btn-key-c-high'
    };

    document.addEventListener('keydown', (keydownEvent) => {
        // console.log(`In keydown EventListener for piano notes`); //DB 
        if (keyMappings.hasOwnProperty(keydownEvent.key) && !keydownEvent.repeat) {
            // console.log(`In keydown event keyMappings check`);
            const targetId = keyMappings[keydownEvent.key]; 
            audioPlayer.playNote(keydownEvent, targetId, keyMappings); 
        }
    }); 

} 


async function CreateAudioBuffers(audioContext, noteNames) {
    // Creates the AudioBuffers from the mp3 Files, one for every note in array noteNames
    try { 
        // console.log("At start of try block in CreateAudioBuffers"); //DB 

        const returnArray = [];

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


function GenerateAudioPlayer(audioBuffers, audioContext, noteNames) {
    const audioPlayer = { 
        audioBuffers: audioBuffers, 
        audioContext: audioContext, 
        noteNames: noteNames, 
        // Tracker variable to help with key release synchronization with audio termination
        mouseDown: false, 
        pedalDown: false, 
        liveNoteArray: [], 
        setup() { 
            this.setupPedalListeners(); 
            this.handlePrimaryGain(); 
            this.handleDynamicsCompressor(); 
        },
        setupPedalListeners() {
            // console.log(`In setupPedalListeners()`); //DB

            const pedalButton = document.getElementById("pedal-button");

            // Use arrow function to make sure "this" is audioPlayer, not pedalButton
            pedalButton.addEventListener("click", () => {
                this.pedalDown = !this.pedalDown;
                this.checkPedalTermination();
                this.togglePedalVisual();
            }); 

            document.addEventListener("keydown", (keydownEvent) => { 
                // console.log(`In the keydown EventListener for space`); //DB 
                if (keydownEvent.code === "Space" && !keydownEvent.repeat) { 
                    console.log(`In (keydownEvent.code === "Space") block`); //DB
                    this.pedalDown = !this.pedalDown;
                    this.checkPedalTermination(); 
                    this.togglePedalVisual();
                }
            });

            document.addEventListener("keyup", (keyupEvent) => { 
                console.log(`In the keyup EventListener for space`); //DB 
                if (keyupEvent.code === "Space" && !keyupEvent.repeat) { 
                    console.log(`In (keyupEvent.code === "Space") block`); //DB
                    this.pedalDown = !this.pedalDown;
                    this.checkPedalTermination(); 
                    this.togglePedalVisual();
                }
            });
            
        }, 
        checkPedalTermination() { 
            console.log(`In checkPedalTermination()`); //DB 
            if (!this.pedalDown) { 
                for (const liveNote of this.liveNoteArray) {
                    // If the audio didn't terminate due to pedal condition
                    if (!liveNote.terminated) {
                        liveNote.terminateAudio(this.pedalDown, this.liveNoteArray);
                    } 
                }
            }
        }, 
        togglePedalVisual() { 
            console.log(`In togglePedalVisual()`); //DB 
            const pedalButton = document.getElementById("pedal-button"); 
            const glowingLight = document.getElementById("glowing-light-span"); 
        
            if (this.pedalDown) { 
                pedalButton.classList.add("pedal-button-on");
                glowingLight.classList.remove("glowing-light-span-off"); 
                glowingLight.classList.add("glowing-light-span-on"); 
            } else {
                pedalButton.classList.remove("pedal-button-on"); 
                glowingLight.classList.remove("glowing-light-span-on"); 
                glowingLight.classList.add("glowing-light-span-off");
            } 
        },
        handlePrimaryGain() { 
            this.createPrimaryGain(); 
            this.connectPrimaryGain(); 
        },
        handleDynamicsCompressor() { 
            this.createDynamicsCompressor(); 
            this.connectDynamicsCompressor(); 
        },
        createPrimaryGain(gainValue=1) { 
            this.primaryGainControl = this.audioContext.createGain(); 
            this.primaryGainControl.gain.setValueAtTime(gainValue, 0); 
            // console.log("At end of createPrimaryGain body"); //DB 
        },
        connectPrimaryGain() { 
            this.primaryGainControl.connect(audioContext.destination); 
        },
        createDynamicsCompressor() {
            this.dynamicsCompressor = this.audioContext.createDynamicsCompressor();
        },
        connectDynamicsCompressor() { 
            this.dynamicsCompressor.connect(this.primaryGainControl); 
        },
        playNote(event, targetId, keyMappings=null) { 
            // console.log(`At start of playNoteMouse`); //DB 
            // console.log(`event.target = ${e ent.target}`); //DB 

            let noteObject = ConstructNoteObject(this.audioContext,
                this.audioBuffers, targetId,
                this.dynamicsCompressor, this.noteNames); 
            noteObject.createNote();
            noteObject.createNoteGain();
            noteObject.playAudio(); 

            if (event.type === 'mousedown') {
                this.handleMouseUpOut(event, noteObject); 
            }
            else if (event.type === 'keydown') { 
                this.handleKeyUp(event, noteObject, keyMappings); 
            }

            // Regardless of pedal or holding notes, end audio after x seconds 
            setTimeout(() => { 
                console.log(`In timed self-termination in playNote()`); 
                if (!noteObject.terminated)
                    noteObject.terminateAudio(this.pedalDown, this.liveNoteArray, bypassPedal=true); 
            }, 9000);
            
            // console.log("We are at end of the playNoteMouse body"); //DB
        }, 
        handleMouseUpOut(originalEvent, noteObject) {
            // Default behavior of piano is to play note for x time, then do exponential decay after that 

            // Both of these things are true when we first play the note
            let mouseDown = true; 
            let mouseIn = true; 

            // To be used in handleMouseUpOut()
            originalEvent.target.addEventListener("mouseup", () => {
                // console.log(`In the first mouseup eventListener for ${originalEvent.target.id}`); //DB
                mouseDown = false;
            }, { once: true });
            originalEvent.target.addEventListener("mouseout", () => {
                // console.log(`In the first mouseout eventListener for ${originalEvent.target.id}`); //DB
                mouseIn = false;
            }, { once: true }); 

            setTimeout(() => { 
                // console.log("In the terminateAudio setTimeout"); //DB 
                // console.log(`In the terminateAudio setTimeout for ${originalEvent.target.id}, mouseDown = ${mouseDown} and mouseIn = ${mouseIn}`); //DB 

                if (!mouseDown || !mouseIn) { 
                    // console.log(`In the !mouseDown || !mouseIn block); //DB
                    // If audio didn't terminate due to pedal, need to be able to reference it later, so pass in this.liveNoteArray
                    noteObject.terminateAudio(this.pedalDown, this.liveNoteArray);
                    
                } else {
                    // 
                    const handleMouseTerminate = () =>  {
                        console.log(`In handleMouseTerminate`); //DB
                        if (!noteObject.terminated) { 
                            noteObject.terminateAudio(this.pedalDown, this.liveNoteArray);
                        }
                    }; 

                    originalEvent.target.addEventListener(
                        "mouseup",
                        handleMouseTerminate,
                        { once: true }
                    );

                    originalEvent.target.addEventListener(
                        "mouseout", 
                        handleMouseTerminate,
                        { once: true }
                    );
                }
            }, 500);
        },
        handleKeyUp(keydownEvent, noteObject, keyMappings) {

            let keyDown = true; 
            const keyDowned = keydownEvent.key;
        
            keydownEvent.target.addEventListener("keyup", (keyupEvent) => {
                // console.log(`In the first keyup eventListener for ${keyupEvent.key}`); //DB
                // Change flag only if the keyup event was performed on the same key as performed the keydown event
                if (keyDowned === keyupEvent.key) {
                    keyDown = false;
                }
            });

            setTimeout(() => { 
                // console.log(`In the terminateAudio setTimeout from keydown event for ${}`); //DB 
                
                if (!keyDown) { 
                    // console.log("In the !keyDown check block"); //DB
                    noteObject.terminateAudio(this.pedalDown, this.liveNoteArray);
                } else {
                    // console.log(`In the else statement of !keyDown`); //DB
                    const handleKeyupTerminate = (keyupEvent) => {
                        // console.log(`In handleKeyupTerminate`); //DB
                        // Need to check the keyup event target key every time since the target keyupEvent is the document
                        if (keyDowned === keyupEvent.key) { 
                            if (!noteObject.terminated) { 
                                noteObject.terminateAudio(this.pedalDown, this.liveNoteArray);
                                // Remove event listener so that we don't keep checking this condition after audio is terminated
                                keydownEvent.target.removeEventListener(
                                    "keyup", 
                                    handleKeyupTerminate
                                ); 
                                
                            } 
                        }
                    }

                    keydownEvent.target.addEventListener(
                        "keyup", 
                        handleKeyupTerminate
                    );
                }
            }, 500);
            
        }
    }
    return audioPlayer
}


function ConstructNoteObject(audioContext, audioBuffers, targetId, dynamicsCompressor, noteNames) { 
    const note = { 
        audioContext: audioContext, 
        audioBuffers: audioBuffers, 
        targetId: targetId, 
        dynamicsCompressor: dynamicsCompressor,
        noteNames: noteNames, 
        terminated: false, 
        createNote() { 
            // console.log(`At the start of note method createNote()`); //DB 
            let audioBuffersIndex = this.noteIndexFromId(); 
            // console.log(`At end of note method createNote(), we have audioBuffersIndex = ${audioBuffersIndex}`); //DB 
            const noteSource = this.audioContext.createBufferSource();
            noteSource.buffer = this.audioBuffers[audioBuffersIndex]; 
            // console.log(`Do we get to this point in createNote?`); //DB 
            this.noteSource = noteSource; 
        },
        noteIndexFromId() { 
            let audioBuffersIndex;
            switch (this.targetId) { 
                case "btn-key-c-low": 
                    audioBuffersIndex = this.noteNames.indexOf("c3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-c-sharp": 
                    audioBuffersIndex = this.noteNames.indexOf("cSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-d": 
                    audioBuffersIndex = this.noteNames.indexOf("d3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-d-sharp": 
                    audioBuffersIndex = this.noteNames.indexOf("dSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-e": 
                    audioBuffersIndex = this.noteNames.indexOf("e3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-f": 
                    audioBuffersIndex = this.noteNames.indexOf("f3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-f-sharp": 
                    audioBuffersIndex = this.noteNames.indexOf("fSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB 
                    break; 
                case "btn-key-g": 
                    audioBuffersIndex = this.noteNames.indexOf("g3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-g-sharp": 
                    audioBuffersIndex = this.noteNames.indexOf("gSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break;  
                case "btn-key-a": 
                    audioBuffersIndex = this.noteNames.indexOf("a3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-a-sharp": 
                    audioBuffersIndex = this.noteNames.indexOf("aSharp3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-b": 
                    audioBuffersIndex = this.noteNames.indexOf("b3"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break; 
                case "btn-key-c-high": 
                    audioBuffersIndex = this.noteNames.indexOf("c4"); 
                    // console.log(`audioBuffersIndex = ${audioBuffersIndex}`); //DB
                    break;   
            }
            return audioBuffersIndex;
        },
        createNoteGain() { 
            // console.log(`At start of note method createNoteGain()`); //DB 
            // Create gain specific to the new note
            this.noteGain = this.audioContext.createGain(); 
            // console.log(`In createNoteGain, this.noteGain = ${this.noteGain}`); //DB 
            // Above confirms that we are indeed creating a GainNode object. //DB 
            this.noteGain.gain.setValueAtTime(.5, this.audioContext.currentTime); 
            this.noteSource.connect(this.noteGain); 
            this.noteGain.connect(this.dynamicsCompressor); 
        },
        playAudio () { 
            this.noteSource.start(); 
        },
        terminateAudio(pedalDown, liveNoteArray, bypassPedal=false) { 
            console.log(`In terminateAudio()`); //DB 

            // If the note has played for a long enough time, we terminate it even if the pedal is down
            if (!pedalDown || bypassPedal) {
                console.log(`In terminateAudio() !pedalDown block`); // DB 
                this.noteGain.gain.setValueAtTime(.5, 0); 
                // releaseTime is time for noteGain to go to 0
                const releaseTime = 2; 
                this.noteGain.gain.exponentialRampToValueAtTime(
                    .001, 
                    this.audioContext.currentTime + releaseTime
                );
                this.terminated = true; 
            } else { 
                // console.log(`In terminateAudio(), pushing ${this} to liveNoteArray`); //DB
                liveNoteArray.push(this); 
            }
        }
    }
    return note; 
}


