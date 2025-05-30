import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./common/ValidRoutes";
import { fetchDataFromServer } from "./common/ApiImageData";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get("/api/images", (req: Request, res: Response) => {
    //res.json(fetchDataFromServer());
    connectMongo().connect()
        .then(client => {
            const imageProvider = new ImageProvider(client);
            imageProvider.getAllImagesWithAuthors()
                .then(images => {
                    waitDuration(1000)
                        .then(() => {
                            res.json(images);
                        });
                });
        })
        .catch(error => {
            console.error("MongoDB connection failed:", error);
        });
});



app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    const options = {
        root: path.join(__dirname, "../../frontend/dist")
    }
    res.sendFile("index.html", options);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
