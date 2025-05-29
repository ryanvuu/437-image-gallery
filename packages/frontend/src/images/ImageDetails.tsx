import { useParams } from "react-router";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData.ts";
import { ImageNameEditor } from "./ImageNameEditor.tsx";

interface IImageDetails {
    imageData: IApiImageData[];
    isFetchingData: boolean;
    hasErrOccurred: boolean;
    updateImageName: (imageId: string, newName: string) => void;
}

export function ImageDetails(props: IImageDetails) {
    const { imageId } = useParams();
    const image = props.imageData.find(image => image.id === imageId);

    if (props.isFetchingData) {
        return <p>Loading image details...</p>
    }

    if (props.hasErrOccurred) {
        return <p>Failed to load image details.</p>
    }

    if (!image) {
        return <h2>Image not found</h2>;
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor initialValue="" imageId={image.id} onUpdateName={props.updateImageName} />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
