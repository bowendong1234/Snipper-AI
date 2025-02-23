const { exec } = require("child_process");
const path = require("path");

function runVAD(audioFilePath) {
    return new Promise((resolve, reject) => {
        exec(`python vad.py "${audioFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running VAD: ${stderr}`);
                reject(error);
            } else {
                try {
                    const timestamps = JSON.parse(stdout);
                    resolve(timestamps);
                } catch (parseError) {
                    reject(parseError);
                }
            }
        });
    });
}

// testingggg
runVAD("audio.wav")
    .then(timestamps => console.log("Speech timestamps:", timestamps))
    .catch(err => console.error("Error:", err));
