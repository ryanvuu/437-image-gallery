import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData.ts";

interface IAllImages {
    imageData: IApiImageData[];
    isFetchingData: boolean;
    hasErrOccurred: boolean;
}

export function AllImages(props: IAllImages) {
    if (props.isFetchingData) {
        return <p>Loading images...</p>
    }

    if (props.hasErrOccurred) {
        return <p>Failed to load images.</p>
    }

    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={props.imageData} />
        </>
    );
}
