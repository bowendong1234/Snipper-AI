import { useEffect, useState } from "react"
import "./VideoThumbnail.css"

const VideoThumbnail = ({ file }) => {
    const [thumbnail, setThumbnail] = useState("");
    const [fileName, setFileName] = useState("")

    useEffect(() => {
        const videoURL = URL.createObjectURL(file);
        setThumbnail(videoURL);
        setFileName(file.name)
        console.log(file.name)
        return () => URL.revokeObjectURL(videoURL);
    }, [file]);

    return (
        <div className="thumbnail-wrapper">
            <div className="filename-text">{fileName}</div>
            <div className="thumbnail">
                <video src={thumbnail} width="200px" height="200px" controls/>
            </div>
        </div>
    );
};

export default VideoThumbnail;
