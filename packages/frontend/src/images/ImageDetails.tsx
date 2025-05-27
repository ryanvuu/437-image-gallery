import { useParams } from "react-router";
import type { IImageData } from "../MockAppData.ts";

interface IImageDetails {
    imageData: IImageData[]
}

export function ImageDetails(props: IImageDetails) {
    const { imageId } = useParams();
    const image = props.imageData.find(image => image.id === imageId);
    if (!image) {
        return <h2>Image not found</h2>;
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
