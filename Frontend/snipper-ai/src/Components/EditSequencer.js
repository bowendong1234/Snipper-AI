import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const EditSequencer = forwardRef((props, ref) => {
    const [progress, updateProgress] = useState(0)
    let progressIncrement = 0
    const progressMessages = {
        uploadVideos: "Uploading videos to server...",
        downloadVideosToServer: "Server is retrieving videos and will begin work shortly...",
        snipVideos: "Cutting out awkward silences...",
        addCaptions: "Adding captions...",
        glueVideosTogether: "Glueing videos together",
        sendBackFinalCut: "Sending back the final cut..."
    }

    useImperativeHandle(ref, () => ({
        processVideos: async (files, editingParams) => {
            files.forEach(file => {
                console.log(file.name)
            });
            console.log(editingParams)

            // setting up required parameters
            const uniqueID = editingParams.cutID
            const downloadVideosToServer = true
            const videoOrder = files.map(file => file.name)
            const snipVideos = editingParams.snip
            const addCaptions = editingParams.captions
            const glueVideosTogether = files.length > 1 ? true : false  // only do glueing stage if more than one vid

            // assigning whether or not to execute a step to this json
            const editStepsEnabled = {
                snipVideos: snipVideos,
                downloadVideosToServer: downloadVideosToServer,
                addCaptions: addCaptions,
                glueVideosTogether: glueVideosTogether
            };

            // calculating the progress increment for the loading/progress bar
            calculateProgressIncrement(editStepsEnabled)

            // specifiying request body params
            const requestParameters = {
                downloadVideosToServer: { "ID": uniqueID, "videoFiles": videoOrder },
                snipVideos: { "ID": uniqueID, "videoFiles": videoOrder },
                addCaptions: { "ID": uniqueID, "videoFiles": videoOrder },
                glueVideosTogether: { "ID": uniqueID, "videoFiles": videoOrder }
            }

            await uploadVideos(files, uniqueID)

            // building requests
            const requests = [
                editStepsEnabled.downloadVideosToServer ? () => axios.post("/api/downloadVideos", requestParameters.downloadVideosToServer) : null,
                editStepsEnabled.snipVideos ? () => axios.post("/api/snipVideos", requestParameters.snipVideos) : null,
                editStepsEnabled.addCaptions ? () => axios.post("/api/addCaptions", requestParameters.addCaptions) : null,
                editStepsEnabled.glueVideosTogether ? () => axios.post("/api/glueVideosTogether", requestParameters.glueVideosTogether) : null,
            ].filter(Boolean); // Remove null entries

            // // executing requests
            // for (let i = 0; i < requests.length; i++) {
            //     try {
            //         await requests[i](); // Execute only valid requests
            //         updateProgress(prevProgress => prevProgress + progressIncrement)
            //     } catch (error) {
            //         console.error(`Request ${i + 1} failed:`, error);
            //         break; // Stop execution if an error occurs
            //     }
            // }
        },
    }));

    const uploadVideos = async (files, uniqueID) => {
        console.log("Here")
        try {
            // Generate pre-signed URLs for all files in parallel!!!
            const uploadURLs = await Promise.all(
                files.map((file) =>
                    axios.get(`${API_URL}/generate-upload-url`, {
                        params: { filename: `uploads/${uniqueID}/${file.name}`, fileType: file.type },
                    })
                )
            );
    
            // Extract URLs from response
            const uploadTasks = uploadURLs.map((response, index) => {
                const uploadURL = response.data.uploadURL;
                const file = files[index];
    
                return axios.put(uploadURL, file, {
                    headers: { "Content-Type": file.type },
                });
            });
    
            // Upload all files in parallel
            await Promise.all(uploadTasks);
    
            alert("Upload Successful!");
        } catch (error) {
            console.error("Upload Failed:", error);
        }
        //  OLD SEQUENTIAL METHOD
        // // Uploading vids to S3
        // try {
        //     for (const file of files) {
        //         const response = await axios.get(`${API_URL}/generate-upload-url`, {
        //             params: { filename: `uploads/${uniqueID}/${file.name}`, fileType: file.type },
        //         });

        //         const { uploadURL } = response.data;
        //         await axios.put(uploadURL, file, { headers: { "Content-Type": file.type } });
        //     }

        //     alert("Upload Successful!");
        // } catch (error) {
        //     console.error("Upload Failed:", error);
        // }
    };

    // function for calculating the progress increment
    const calculateProgressIncrement = (editStepsEnabled) => {
        var steps = 3  // default enabled steps are upload, download to backend and send back
        if (editStepsEnabled.snipVideos) {
            steps = steps + 1
        }
        if (editStepsEnabled.addCaptions) {
            steps = steps + 1
        }
        if (editStepsEnabled.glueVideosTogether) {
            steps = steps + 1
        }
        progressIncrement = 100 / steps

    }


    return (
        <div className="progress">
            <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                aria-valuenow="75"
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: progress }}
            ></div>
        </div>
    );
});

export default EditSequencer;

