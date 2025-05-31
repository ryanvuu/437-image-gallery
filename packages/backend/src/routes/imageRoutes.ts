import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";

const MAX_NAME_LENGTH = 100;

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  app.get("/api/images", (req: Request, res: Response) => {
    let searchQuery = req.query.name;
    if (typeof searchQuery !== "string") {
      searchQuery = "";
    }
    imageProvider.getAllImagesWithAuthors(searchQuery)
      .then(images => {
        waitDuration(1000)
          .then(() => {
            res.json(images);
          });
      })
      .catch(error => {
        console.error("Failed to retrieve images:", error)
      })
    console.log(searchQuery);
  });

  app.put("/api/images/:imageId", (req: Request, res: Response) => {
    const imageId = req.params.imageId;
    const newName = req.body.newName;

    // invalid image id
    if (!ObjectId.isValid(imageId)) {
      res.status(404).send({
        error: "Not Found",
        message: "Image does not exist"
      });
    }

    // request bad format
    if (!newName) {
      res.status(400).send({
        error: "Bad Request",
        message: "New name not of valid type"
      });
    }

    // image name too long
    if (newName.length > 100) {
      res.status(422).send({
        error: "Unprocessable Entity",
        message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
      });
    }


    imageProvider.updateImageName(imageId, newName)
      .then(numDocsUpdated => {
        if (numDocsUpdated > 0) {
          res.status(204).send();
        }
        else {
          res.status(404).send({
            error: "Not Found",
            message: "Image does not exist"
          });
        }
      })
      .catch(error => {
        console.error("Failed to update image name:", error);
      });
  })
}

function waitDuration(numMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, numMs));
}