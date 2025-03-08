import { useState, memo, useEffect, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { CSS } from "@dnd-kit/utilities";
import VideoThumbnail from "./VideoThumbnail";
import "./Upload.css";
import { Scrollbar } from 'smooth-scrollbar-react';

const API_URL = process.env.REACT_APP_API_URL;

const SortableItem = memo(({ file, deleteFile }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: file.name,
    modifiers: [
      (args) => {
        // Don't start drag if the target is a button
        if (args.event.target.tagName === 'BUTTON') {
          return { ...args, delta: { x: 0, y: 0 } };
        }
        return args;
      }
    ]
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag handle area */}
      <div className="drag-handle" {...attributes} {...listeners}>
        <img src="./drag-bar.svg" style={{ width: 15, height: 7, objectFit: "cover" }}></img>
      </div>
      <VideoThumbnail file={file} deleteFile={deleteFile} />
    </div>
  );
});

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    console.log("Files state updated:", files);
  }, [files]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validVideos = selectedFiles.filter(file => file.type.startsWith("video/"));
    const invalidFiles = selectedFiles.length - validVideos.length;

    if (invalidFiles > 0) {
      alert("Some files were not videos and were removed.");
    }

    setFiles(prevFiles => {
      const existingFileNames = new Set(prevFiles.map(f => f.name));
      const newFiles = validVideos.filter(file => !existingFileNames.has(file.name));
      return [...prevFiles, ...newFiles];
    });
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

  const deleteFile = useCallback((file) => {
    setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
  }, []);

  return (
    <div className="upload-container">

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToHorizontalAxis]}>
        <SortableContext items={files.map(file => file.name)}>
          <div className="thumbnails-container">
            <label for="file-upload" class="choose-file-button">
              <div>Upload Videos</div>
              <svg width="50" height="50" viewBox="0 0 501 563" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 313V513C17 531.41 31.924 546.333 50.3333 546.333H450.333C468.743 546.333 483.667 531.41 483.667 513V313" stroke-width="33.3333" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M250.333 417V17M250.333 17L117 150.333M250.333 17L383.667 150.333" stroke-width="33.3333" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {/* <img src="/upload-icon.svg" alt="upload icon" style={{ width: 50 }}></img> */}
            </label>
            <input id="file-upload" type="file" multiple onChange={handleFileChange} className="file-input"></input>
              {files.map(file => (
                <SortableItem key={file.name} file={file} deleteFile={deleteFile} />
              ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="generate-button-container">
        <button onClick={handleUpload} disabled={uploading} className="shadow__btn">
          {uploading ? "Uploading..." : "Generate Final Cut!"}
        </button>
      </div>
    </div>
  );
};

export default Upload;
