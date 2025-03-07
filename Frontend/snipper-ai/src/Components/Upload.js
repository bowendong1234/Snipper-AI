import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import VideoThumbnail from "./VideoThumbnail";
import "./Upload.css";

const API_URL = process.env.REACT_APP_API_URL;

const SortableItem = ({ file }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.name });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <VideoThumbnail file={file} />
    </div>
  );
};

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validVideos = selectedFiles.filter(file => file.type.startsWith("video/"));
    const invalidFiles = selectedFiles.length - validVideos.length;

    if (invalidFiles > 0) {
      alert("Some files were not videos and were removed.");
    }

    setFiles(prevFiles => [...prevFiles, ...validVideos]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert("Please select at least one video!");

    setUploading(true);
    const uniqueID = uuidv4();

    console.log("Unique ID:", uniqueID);
    console.log("Final video order:", files.map(file => file.name));

    try {
      for (const file of files) {
        const response = await axios.get(`${API_URL}/generate-upload-url`, {
          params: { filename: `uploads/${uniqueID}/${file.name}`, fileType: file.type },
        });

        const { uploadURL } = response.data;
        await axios.put(uploadURL, file, { headers: { "Content-Type": file.type } });
      }

      alert("Upload Successful!");
    } catch (error) {
      console.error("Upload Failed:", error);
    }

    setUploading(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex(file => file.name === active.id);
      const newIndex = files.findIndex(file => file.name === over.id);
      setFiles(arrayMove(files, oldIndex, newIndex));
    }
  };

  return (
    <div className="upload-container">

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map(file => file.name)}>
          <div className="thumbnails-container">
            <label for="file-upload" class="choose-file-button">
              <div>Upload Videos</div>
              <img src="/upload-icon.svg" alt="upload icon" style={{ width: 50 }}></img>
            </label>
            <input id="file-upload" type="file" multiple onChange={handleFileChange} className="file-input"></input>
            {files.map(file => (
              <SortableItem key={file.name} file={file} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="generate-button-container">
        <button onClick={handleUpload} disabled={uploading} className="shadow__btn">
          {uploading ? "Uploading..." : "Begin Processing!"}
        </button>
      </div>
    </div>
  );
};

export default Upload;
