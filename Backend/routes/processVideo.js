const { exec } = require("child_process");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile})
const { S3Client } = require("@aws-sdk/client-s3");

// initialising s3 client for uploading vids to bucket
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// S3 Bucket Name
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

        const inputVideos = videoFiles.map(file => path.join(__dirname, "downloads", file)).join("|");
        const outputVideo = path.join(__dirname, "processed", "final_vlog.mp4");

        // Run FFmpeg command
        exec(`ffmpeg -i "concat:${inputVideos}" -c copy ${outputVideo}`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${stderr}`);
                return res.status(500).json({ error: "Video processing failed" });
            }
            console.log(`Success: ${stdout}`);

            // Delete downloaded files after processing
            videoFiles.forEach(file => {
                const filePath = path.join(__dirname, "downloads", file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });

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
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: BUCKET_NAME,
            Key: `uploads/${fileName}`
        };

        const fileStream = fs.createWriteStream(outputPath);
        s3.getObject(params).createReadStream()
            .on("error", reject)
            .pipe(fileStream)
            .on("finish", resolve);
    });
}

module.exports = router;
