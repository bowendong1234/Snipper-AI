import { useState, memo, useEffect, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { CSS } from "@dnd-kit/utilities";
import VideoThumbnail from "./VideoThumbnail";
import "./Upload.css";

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
      <div className="drag-handle" {...attributes} {...listeners}>
        <img src="./drag-bar.svg" alt="drag bar icon" style={{ width: 15, height: 7, objectFit: "cover" }}></img>
      </div>
      <VideoThumbnail file={file} deleteFile={deleteFile} />
    </div>
  );
});

const Upload = ({ initiateVideoEditing }) => {
  const [files, setFiles] = useState([]);
  const [snipBoringParts, setSnipBoringParts] = useState(false);
  const [addCaptions, setAddCaptions] = useState(false);
  const [addMusic, setAddMusic] = useState(false);

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
    const isValid = await validateVideos(files);
    if (isValid) {
        console.log("All checks passed! Proceed with generation.");
        const uniqueID = uuidv4();
        localStorage.setItem("cutID", uniqueID)
    
        const renamedFiles = renameFiles(files, uniqueID)
    
        console.log("Unique ID:", uniqueID);
        console.log("Final video order:", renamedFiles.map(file => file.name));
    
        initiateVideoEditing(renamedFiles, { cutID: uniqueID, snip: snipBoringParts, captions: addCaptions })
    }

    // // Uploading vids to S3
    // try {
    //   for (const file of files) {
    //     const response = await axios.get(`${API_URL}/generate-upload-url`, {
    //       params: { filename: `uploads/${uniqueID}/${file.name}`, fileType: file.type },
    //     });

    //     const { uploadURL } = response.data;
    //     await axios.put(uploadURL, file, { headers: { "Content-Type": file.type } });
    //   }

    //   alert("Upload Successful!");
    // } catch (error) {
    //   console.error("Upload Failed:", error);
    // }

  };

  const renameFiles = (files, uniqueID) => {
    return files.map(file => {
      const newName = `${uniqueID}${file.name}`;
      return new File([file], newName, { type: file.type });
    });
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

  function validateVideos(files) {
    if (files.length === 0) {
        alert("Please select at least one video!");
        return false;
    }

    // Check total file size (80MB limit)
    const maxTotalSize = 80 * 1024 * 1024; // 80MB in bytes
    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);

    if (totalSize > maxTotalSize) {
        alert("Total file size exceeds 80MB. Please select smaller videos.");
        return false;
    }

    // Check video dimensions
    let firstVideoWidth = null;
    let firstVideoHeight = null;

    const checkDimensions = (file) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);

            video.onloadedmetadata = () => {
                if (firstVideoWidth === null) {
                    firstVideoWidth = video.videoWidth;
                    firstVideoHeight = video.videoHeight;
                } else if (video.videoWidth !== firstVideoWidth || video.videoHeight !== firstVideoHeight) {
                    reject("Videos must have the same dimensions!");
                }
                resolve();
            };

            video.onerror = () => reject("Error loading video file.");
        });
    };

    return Promise.all(Array.from(files).map(checkDimensions))
        .then(() => true) // All checks passed
        .catch((error) => {
            alert(error);
            return false;
        });
}


  return (
    <div className="upload-container">
    <div className="label-text">Click on the toggles below to enable what edits you would like made to your final video.
      Once you have uploaded your videos, drag them in the order you want them to be sequenced in for your final video.
      Please ensure all videos are the same dimensions and the total size of all videos does not exceed 80MB. The adding 
      of captions and music as well as other features and lowered restrictions will be added soon, stay tuned!
    </div>
    <div className="toggle-container">
      <div className="toggle-item">
        <label className="toggle-label">
          <span className="label-text">Snip out boring parts</span>
          <div 
            className={`toggle ${snipBoringParts ? 'active' : ''}`}
            onClick={() => setSnipBoringParts(!snipBoringParts)}
          >
            <div className="toggle-switch"></div>
          </div>
        </label>
      </div>
      
      <div className="toggle-item disabled">
        <label className="toggle-label">
          <span className="label-text">Add captions</span>
          <div className="toggle disabled">
            <div className="toggle-switch"></div>
          </div>
          <span className="coming-soon">coming soon...</span>
        </label>
      </div>
      
      <div className="toggle-item disabled">
        <label className="toggle-label">
          <span className="label-text">Add music</span>
          <div className="toggle disabled">
            <div className="toggle-switch"></div>
          </div>
          <span className="coming-soon">coming soon...</span>
        </label>
      </div>
    </div>
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
            {!files.length ? (
              <div className="direction-text">
                Uploaded videos will appear here
                <span className="btn-arrow">→</span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <div className="generate-button-container">
        <button onClick={handleUpload} className="generate-btn">
          Generate Final Cut!
        </button>
      </div>
    </div>
  );
};

export default Upload;
