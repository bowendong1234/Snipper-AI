import { React, useState, useRef, useEffect } from 'react';
import Upload from '../Components/Upload';
import EditSequencer from '../Components/EditSequencer';
import './UploadVideoPage.css'

const UploadVideoPage = () => {
    const [startProcessing, setStartProcessing] = useState(false);
    const [pendingFiles, setPendingFiles] = useState(null);
    const [pendingParams, setPendingParams] = useState(null);
    const EditSequencerRef = useRef();

    const initiateVideoEditing = (files, editingParams) => {
        setPendingFiles(files);
        setPendingParams(editingParams);
        setStartProcessing(true);
    };

    useEffect(() => {
        if (startProcessing && EditSequencerRef.current) {
            console.log("Processing videos...");
            EditSequencerRef.current.processVideos(pendingFiles, pendingParams);
        }
        setStartProcessing(false)
    }, [startProcessing]);

    return (
        <div className="background">
            <Upload initiateVideoEditing={initiateVideoEditing} />
            {startProcessing && <EditSequencer ref={EditSequencerRef} />}
        </div>
    );
};

export default UploadVideoPage