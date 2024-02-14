// Code below to check to make sure DOM content loaded before adding event listeners.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ready()
    });
} else {
    ready();
}


async function ready() { 
    // This array used to create AudioBuffers, as well as for identifying the specific button pressed. 
    const noteNames = [
        "c3", "cSharp3", "d3", "dSharp3", "e3", "f3", "fSharp3", "g3", "gSharp3", "a3", "aSharp3", "b3", "c4"
    ];

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffers = await CreateAudioBuffers(audioContext, noteNames);
    const audioPlayer = GenerateAudioPlayer(audioBuffers, audioContext, noteNames); 
    audioPlayer.setupAudio(); 

    // Adds event listeners to buttons for mouse down event
    var pianoKeys = document.querySelectorAll('.btn-key-white, .btn-key-black');
    for (var i = 0; i < pianoKeys.length; i++) {
        var button = pianoKeys[i];
        button.addEventListener('mousedown', (event) => { 
            audioPlayer.playNoteMouse(event); 
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
        if (keyMappings.hasOwnProperty(keydownEvent.key) && !keydownEvent.repeat) {
            // console.log(`In keydown event keyMappings check`); 
            // const targetId = keyMappings[keydownEvent.key]; 
            // // Use fakeEvent so that I can use the same behavior 
            // const fakeEvent = { target: document.getElementById(targetId) }; 
            audioPlayer.playNoteKeydown(keydownEvent, keyMappings); 
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
        setupAudio() { 
            this.handlePrimaryGain(); 
            this.handleDynamicsCompressor(); 
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
        playNoteMouse(event) { 
            // console.log(`At start of playNoteMouse`); //DB 
            // console.log(`event.target = ${e ent.target}`); //DB 

            // Both of these things are true when we first play the note
            let mouseDown = true; 
            let mouseIn = true; 

            event.target.addEventListener("mouseup", () => {
                // console.log(`In the first mouseup eventListener for ${event.target.id}`); //DB
                mouseDown = false;
            }, { once: true });
            event.target.addEventListener("mouseout", () => {
                // console.log(`In the first mouseout eventListener for ${event.target.id}`); //DB
                mouseIn = false;
            }, { once: true }); 

            let noteObject = ConstructNoteObject(this.audioContext,
                this.audioBuffers, event.target.id,
                this.dynamicsCompressor, this.noteNames); 
            noteObject.createNote();
            noteObject.createNoteGain();
            noteObject.playAudio(); 

            // Default behavior of piano is to play note for x time, then do exponential decay after that 
            setTimeout(() => { 
                // console.log("In the terminateAudio setTimeout"); //DB 
                console.log(`In the terminateAudio setTimeout for ${event.target.id}, mouseIn = ${mouseIn}`); //DB 

                if (!mouseDown || !mouseIn) { 
                    // console.log("In the not mouseDown or not mouseIn check block"); //DB
                    noteObject.terminateAudio();
                } else {
                    const handleMouseUpTerminate = () => {
                        // console.log(`In handleMouseUpTerminate`); //DB 
                        noteObject.terminateAudio();
                        event.target.removeEventListener(
                            "mouseout", handleMouseOutTerminate);
                        return;
                    }

                    const handleMouseOutTerminate = () =>  {
                        // console.log(`In handleMouseOutTerminate`); //DB 
                        noteObject.terminateAudio();
                        event.target.removeEventListener(
                            "mouseup", handleMouseUpTerminate); 
                        return; 
                    }

                    // New event listeners to terminate audio at right time if past one second. Previous event listeners still exist. 
                    event.target.addEventListener(
                        "mouseup",
                        handleMouseUpTerminate,
                        { once: true }
                    );

                    event.target.addEventListener(
                        "mouseout", 
                        handleMouseOutTerminate,
                        { once: true }
                    );
                }
            }, 1000);
            
            // console.log("We are at end of the playNoteMouse body"); //DB
        }, 
        playNoteKeydown(keydownEvent, keyMappings) {
            // console.log(`At start of playNoteKeydown`); //DB 
            // console.log(`event.target = ${event.target}`); //DB 

            let keyDown = true; 

            const keyDowned = keydownEvent.key;
            const keyDownedId =  keyMappings[keydownEvent.key]; 
        
            keydownEvent.target.addEventListener("keyup", (keyupEvent) => {
                // console.log(`In the first keyup eventListener for ${keyupEvent.key}`); //DB
                // Change flag only if the keyup event was performed on the same key as performed the keydown event
                if (keyDowned == keyupEvent.key) {
                    keyDown = false;
                }
            });

            let noteObject = ConstructNoteObject(this.audioContext,
                this.audioBuffers, keyDownedId, this.dynamicsCompressor, this.noteNames); 
            noteObject.createNote();
            noteObject.createNoteGain();
            noteObject.playAudio(); 

            setTimeout(() => { 
                // console.log(`In the terminateAudio setTimeout from keydown event for ${}`); //DB 
                
                if (!keyDown) { 
                    // console.log("In the !keyDown check block"); //DB
                    noteObject.terminateAudio();
                } else {
                    // console.log(`In the else statement of !keyDown`); //DB

                    const handleKeyupTerminate = (keyupEvent) => {
                        // console.log(`In handleKeyupTerminate`); //DB 

                        if (keyDowned == keyupEvent.key) { 
                            noteObject.terminateAudio();
                            keydownEvent.target.removeEventListener(
                                "keyup", 
                                handleKeyupTerminate
                            ); 
                        }
                    }

                    keydownEvent.target.addEventListener(
                        "keyup", 
                        handleKeyupTerminate
                    );
                }
            }, 1000);
            
            // console.log("We are at end of the playNoteMouse body"); //DB
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
        terminateAudio() { 
            console.log(`At start of note method terminateAudio()`); //DB 
            this.noteGain.gain.setValueAtTime(.5, 0); 
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


