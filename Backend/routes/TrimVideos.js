const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

async function trimVideos(timestamps, downloadsDir) {
    const promises = Object.entries(timestamps).map(async ([fileName, data]) => {
        // Use absolute paths consistently
        const downloadsPath = path.join(__dirname, downloadsDir);
        const videoPath = path.join(downloadsPath, fileName);
        const speechSegments = data.timestamps;

        if (!speechSegments || speechSegments.length === 0) {
            console.log(`No speech detected in ${fileName}, keeping it unchanged.`);
            return;
        }

        const tempFiles = [];

        // Trim each speech segment and save as temporary files
        await Promise.all(speechSegments.map(async ([start, end], index) => {
            const outputSegmentName = `part${index}_${fileName}`;
            const outputSegment = path.join(downloadsPath, outputSegmentName);
            tempFiles.push(outputSegmentName); // Store just the filename, not the full path

            const ffmpegCmd = `ffmpeg -i "${videoPath}" -ss ${start} -to ${end} -c copy "${outputSegment}"`;

            await new Promise((resolve, reject) => {
                exec(ffmpegCmd, (error) => {
                    if (error) {
                        console.error(`Error trimming ${fileName}:`, error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }));

        // Create concat file in the downloads directory
        const fileListName = `${fileName}_concat.txt`;
        const fileListPath = path.join(downloadsPath, fileListName);
        
        // Create proper relative paths for the concat file - FFmpeg expects simple file references
        const fileListContent = tempFiles
            .map(file => `file '${file}'`)
            .join("\n");

        fs.writeFileSync(fileListPath, fileListContent);

        // Create a temporary output file
        const tempOutputName = `temp_output_${fileName}`;
        const tempOutputPath = path.join(downloadsPath, tempOutputName);

        // Make sure we're in the correct working directory for FFmpeg
        const ffmpegCommand = `cd "${downloadsPath}" && ffmpeg -f concat -safe 0 -i "${fileListName}" -c copy -reset_timestamps 1 "${tempOutputPath}"`;
        console.log("Running command:", ffmpegCommand);

        return new Promise((resolve, reject) => {
            exec(ffmpegCommand, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${stderr}`);
                    reject(error);
                    return;
                }
                console.log(`Success: ${stdout}`);

                try {
                    // Temporarily rename original file as backup
                    const backupName = `backup_${fileName}`;
                    const backupPath = path.join(downloadsPath, backupName);
                    fs.renameSync(videoPath, backupPath);
                    
                    // Move the temporary output to the original filename
                    fs.renameSync(tempOutputPath, videoPath);
                    
                    // Delete the backup file
                    if (fs.existsSync(backupPath)) {
                        fs.unlinkSync(backupPath);
                    }
                    
                    // Delete temporary files after processing
                    tempFiles.forEach(file => {
                        const filePath = path.join(downloadsPath, file);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    });

                    // Delete the .txt file
                    if (fs.existsSync(fileListPath)) {
                        fs.unlinkSync(fileListPath);
                    }
                    
                    resolve();
                } catch (cleanupError) {
                    console.error("Error during file replacement or cleanup:", cleanupError);
                    reject(cleanupError);
                }
            });
        });
    });

    return Promise.all(promises);
}

module.exports = { trimVideos }