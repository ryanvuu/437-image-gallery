import { AllImages } from "./images/AllImages.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { useEffect, useRef, useState } from "react";
import { ValidRoutes } from "../../backend/src/common/ValidRoutes.ts";
import type { IApiImageData } from "../../backend/src/common/ApiImageData.ts";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";

function App() {
    const [imageData, _setImageData] = useState<IApiImageData[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [hasErrOccurred, setHasErrOccurred] = useState(false);
    const [imageSearchInput, setImageSearchInput] = useState("");
    const ref = useRef(0);

    async function fetchImages(searchName: string = "") {
        ref.current += 1;
        const requestNum = ref.current;
        setIsFetchingData(true);

        const url = searchName !== ""
            ? `/api/images?name=${searchName}`
            : `/api/images`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                setHasErrOccurred(true);
                throw new Error(`Failed to fetch /api/images: ${res.status}`);
            })
            .then(images => {
                if (ref.current === requestNum) {
                    _setImageData(images);
                }
            })
            .catch(error => {
                console.error(error);
                setHasErrOccurred(true);
            })
            .finally(() => {
                setIsFetchingData(false);
            });
    }

    function updateImageName(imageId: string, newName: string) {
        const idxToUpdate = imageData.findIndex((image : IApiImageData) => image.id === imageId);
        const updatedImageData = [...imageData];
        updatedImageData[idxToUpdate] = { ...updatedImageData[idxToUpdate], name: newName };
        _setImageData(updatedImageData);
    }

    function handleImageSearch() {
        fetchImages(imageSearchInput);
    }

    useEffect(() => {
        // Code in here will run when App is created
        fetchImages();
    }, []);

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={ValidRoutes.HOME} element={<AllImages imageData={imageData} isFetchingData={isFetchingData} hasErrOccurred={hasErrOccurred} searchPanel={<ImageSearchForm searchString={imageSearchInput} onSearchStringChange={setImageSearchInput} onSearchRequested={handleImageSearch} />} />} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />

                <Route path={ValidRoutes.IMAGE_DETAILS} element={<ImageDetails imageData={imageData} isFetchingData={isFetchingData} hasErrOccurred={hasErrOccurred} updateImageName={updateImageName} />}></Route>

            </Route>
        </Routes>
    )
}

export default App;
