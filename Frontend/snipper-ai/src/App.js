import TestPage from "./Pages/testPage";
import UploadVideoPage from "./Pages/UploadVideoPage";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<LoginPage />} /> */}
      <Route path="/test" element={<TestPage />} />
      <Route path="/" element={<UploadVideoPage />} />
    </Routes>

  );
  // return (
  //   <div>
  //     <h1>Video Upload to AWS S3</h1>
  //     <Upload />
  //   </div>
  // );
}

export default App;
