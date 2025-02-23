const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

function extractAudio(videoPath, outputAudioPath) {
    return new Promise((resolve, reject) => {
        const command = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${outputAudioPath}" -y`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error extracting audio: ${stderr}`);
                reject(error);
            } else {
                console.log(`Audio extracted: ${outputAudioPath}`);
                resolve(outputAudioPath);
            }
        });
    });
}

function runVAD(audioFilePath) {
    const pythonScript = path.join(__dirname, "audioDetection.py")
    return new Promise((resolve, reject) => {
        exec(`python "${pythonScript}" "${audioFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running VAD: ${stderr}`);
                reject(error);
            } else {
                console.log("Python stdout:", stdout);
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
// runVAD("audio.wav")
//     .then(timestamps => console.log("Speech timestamps:", timestamps))
//     .catch(err => console.error("Error:", err));
module.exports = { extractAudio, runVAD }