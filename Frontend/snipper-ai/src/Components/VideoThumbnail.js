import { useEffect, useState, memo } from "react"
import "./VideoThumbnail.css"

const VideoThumbnail = memo(({ file, deleteFile }) => {
    const [thumbnail, setThumbnail] = useState("");
    const [fileName, setFileName] = useState("")

    useEffect(() => {
        const videoURL = URL.createObjectURL(file);
        setThumbnail(prev => (prev !== videoURL ? videoURL : prev));
    
        if (file.name.length > 15) {
            setFileName(prev => (prev !== file.name.slice(0, 15) + "..." ? file.name.slice(0, 15) + "..." : prev));
        } else {
            setFileName(prev => (prev !== file.name ? file.name : prev));
        }
    
        return () => URL.revokeObjectURL(videoURL);
    }, [file]);

    const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteFile(file)
        // Call your delete function or other actions
        // if (typeof deleteFile === 'function') {
        //     deleteFile(file);
        // }
    };

    return (
        <div className="thumbnail-wrapper">
            <div className="filename-and-bin-container">
                <div className="filename-text">{fileName}</div>
                <button className="delete-button" onClick={handleButtonClick} draggable="false" data-no-dnd="true">
                    <img src="./bin-icon.svg" alt="bin icon" style={{ width: 15, height: 15, objectFit: "cover" }}></img>
                </button>
            </div>
            <div className="thumbnail">
                <video src={thumbnail} width="200px" height="180px" controls />
            </div>
        </div>
    );
});

export default VideoThumbnail;
