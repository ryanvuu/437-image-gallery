import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData.ts";

interface IAllImages {
    imageData: IApiImageData[];
    isFetchingData: boolean;
    hasErrOccurred: boolean;
    searchPanel: React.ReactNode;
}

export function AllImages(props: IAllImages) {
    return (
        <>
            <h2>All Images</h2>
            {props.searchPanel}
            {props.isFetchingData ? <p>Loading images...</p> : null}
            {props.hasErrOccurred ? <p>Failed to load images.</p> : null}
            <ImageGrid images={props.imageData} />
        </>
    );
}
