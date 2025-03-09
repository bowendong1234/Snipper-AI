import { useEffect, useState, forwardRef, useImperativeHandle } from "react"

const EditSequencer = forwardRef((props, ref) => {

    useImperativeHandle(ref, () => ({
        processVideos: async (files, editingParams) => {
          console.log("Function in child triggered by parent!");
          files.forEach(file => {
              console.log(file.name)
          });
          console.log(editingParams)
        },
      }));

    // const processVideos = async (files, editingParams) => {
    //     console.log("GOT HERE")
    //     files.forEach(file => {
    //         console.log(file.name)
    //     });
    //     console.log(editingParams)
    // }

    return (
        <div>
        </div>
    );
});

export default EditSequencer;

