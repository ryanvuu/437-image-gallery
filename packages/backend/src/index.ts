import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./common/ValidRoutes";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { register } from "module";
import { IncomingMessage } from "http";
import { connectMongo } from "./connectMongo";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();
app.use(express.json());

app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
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

connectMongo().connect()
    .then(client => {
        const imageProvider = new ImageProvider(client);
        registerImageRoutes(app, imageProvider);
    })
    .catch(error => {
        console.error("MongoDB connection failed:", error);
    });
