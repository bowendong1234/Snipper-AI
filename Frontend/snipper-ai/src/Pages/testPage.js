import React from 'react'

const TestPage = () => {


    return (
        <div>
            <div>
            TEST PAGE
            </div>
            <div className="progress">
            <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                aria-valuenow="75"
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: "100%" }}
            ></div>
            </div>
        </div>

    )
}

export default TestPage