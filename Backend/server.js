const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile})
const express = require("express");
const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// initialising s3 client for uploading vids to bucket
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

app.get("/generate-upload-url", async (req, res) => {
    const { filename, fileType } = req.query;
    console.log(process.env.AWS_REGION)

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${filename}`,
        ContentType: fileType,
    });

    try {
        const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 }); // URL valid for 60 seconds
        res.json({ uploadURL });
    } catch (err) {
        console.error("Error generating signed URL:", err);
        res.status(500).json({ error: "Failed to generate URL" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
