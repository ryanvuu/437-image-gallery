import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./common/ValidRoutes";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { register } from "module";
import { IncomingMessage } from "http";
import { connectMongo } from "./connectMongo";
import { registerAuthRoutes } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";
import { verifyAuthToken } from "./verifyAuthToken";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR || "uploads"

const app = express();
app.locals.JWT_SECRET = process.env.JWT_SECRET

app.use(express.json());

app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR));

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
        const credsProvider = new CredentialsProvider(client);
        const imageProvider = new ImageProvider(client);
        app.use("/api/*", verifyAuthToken);
        registerAuthRoutes(app, credsProvider);
        registerImageRoutes(app, imageProvider);
    })
    .catch(error => {
        console.error("MongoDB connection failed:", error);
    });
