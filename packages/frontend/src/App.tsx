import { AllImages } from "./images/AllImages.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { fetchDataFromServer } from "./MockAppData.ts";
import { useState } from "react";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";

function App() {
    const [imageData, _setImageData] = useState(fetchDataFromServer);

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={ValidRoutes.HOME} element={<AllImages imageData={imageData}/>} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />

                <Route path={ValidRoutes.IMAGE_DETAILS} element={<ImageDetails imageData={imageData}/>}></Route>

            </Route>
        </Routes>
    )
}

export default App;
