import TestPage from "./Pages/testPage";
import UploadVideoPage from "./Pages/UploadVideoPage";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./Pages/LandingPage";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<LoginPage />} /> */}
      <Route path="/test" element={<TestPage />} />
      <Route path="/editVideo" element={<UploadVideoPage />} />
      <Route path="/" element={<LandingPage />} />
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
