import { ImageGrid } from "./ImageGrid.tsx";
import type { IImageData } from "../MockAppData.ts";

interface IAllImages {
    imageData: IImageData[]
}

export function AllImages(props: IAllImages) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={props.imageData} />
        </>
    );
}
