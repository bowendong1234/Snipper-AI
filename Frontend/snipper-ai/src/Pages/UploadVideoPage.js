import { React, useState, useRef, useEffect } from 'react';
import Upload from '../Components/Upload';
import EditSequencer from '../Components/EditSequencer';

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
    }, [startProcessing]);

    return (
        <div>
            <Upload initiateVideoEditing={initiateVideoEditing} />
            {startProcessing && <EditSequencer ref={EditSequencerRef} />}
        </div>
    );
};

export default UploadVideoPage