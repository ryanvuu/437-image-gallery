import { AllImages } from "./images/AllImages.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { fetchDataFromServer } from "./MockAppData.ts";
import { useState } from "react";

function App() {
    const [imageData, _setImageData] = useState(fetchDataFromServer);

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<AllImages imageData={imageData}/>} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/images/:imageId" element={<ImageDetails imageData={imageData}/>}></Route>

            </Route>
        </Routes>
    )
}

export default App;
