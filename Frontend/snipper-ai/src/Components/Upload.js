import { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");

    setUploading(true);

    try {
      // getting signed URL
      console.log(API_URL)
      const response = await axios.get(`${API_URL}/generate-upload-url`, {
        params: { filename: file.name, fileType: file.type },
      });

      const { uploadURL } = response.data;

      // uploading to S3
      await axios.put(uploadURL, file, {
        headers: { "Content-Type": file.type },
      });

      alert("Upload Successful!");
    } catch (error) {
      console.error("Upload Failed:", error);
    }

    setUploading(false);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
    </div>
  );
}

export default Upload;
