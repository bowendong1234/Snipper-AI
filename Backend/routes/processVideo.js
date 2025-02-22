const { exec } = require("child_process");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile})
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

// initialising s3 client for uploading vids to bucket
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = "video-uploads-editor";

router.post("/process", async (req, res) => {
    try {
        const { videoFiles } = req.body;
        if (!videoFiles || videoFiles.length === 0) {
            return res.status(400).json({ error: "No videos provided" });
        }

        const downloadPromises = videoFiles.map(async (file) => {
            const filePath = path.join(__dirname, "downloads", file);
            return downloadFromS3(file, filePath);
        });

        await Promise.all(downloadPromises);

        // Create a temporary file list for FFmpeg because concat WONT WORKKKKK
        const fileListPath = path.join(__dirname, "downloads", "file_list.txt");
        const fileListContent = videoFiles
            .map(file => `file '${path.join(__dirname, "downloads", file).replace(/\\/g, "/")}'`)
            .join("\n");

        fs.writeFileSync(fileListPath, fileListContent);

        const outputVideo = path.join(__dirname, "processed", "final_vlog.mp4");

        // FFmpeg command using file list
        const ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${outputVideo}"`;
        console.log("Running command:", ffmpegCommand);  // Debugging output

        exec(ffmpegCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${stderr}`);
                return res.status(500).json({ error: "Video processing failed", details: stderr });
            }
            console.log(`Success: ${stdout}`);

            // Delete downloaded files and temporary list after processing :))))
            videoFiles.forEach(file => {
                const filePath = path.join(__dirname, "downloads", file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });

            if (fs.existsSync(fileListPath)) {
                fs.unlinkSync(fileListPath);
            }

            res.json({ message: "Processing complete", outputVideo });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/test", (req, res) => {
    res.json({ message: "Test route works!" });
});

// Function to download a file from S3
async function downloadFromS3(fileName, outputPath) {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: `uploads/${fileName}`
        };

        // Send request to S3
        const command = new GetObjectCommand(params);
        const { Body } = await s3.send(command);

        // Save file locally
        const fileStream = fs.createWriteStream(outputPath);
        return new Promise((resolve, reject) => {
            Body.pipe(fileStream)
                .on("error", reject)
                .on("finish", resolve);
        });

    } catch (error) {
        console.error("Error downloading from S3:", error);
        throw error;
    }
}

module.exports = router;
