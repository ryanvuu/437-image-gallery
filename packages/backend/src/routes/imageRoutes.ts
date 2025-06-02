import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";

const MAX_NAME_LENGTH = 100;

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  // GET all images, or selection of images if given query parameter "name"
  app.get("/api/images", (req: Request, res: Response) => {
    let searchQuery = req.query.name;
    if (typeof searchQuery !== "string") {
      searchQuery = "";
    }

    imageProvider.getAllImagesWithAuthors(searchQuery)
      .then(images => {
        waitDuration(Math.random() * 5000)
          .then(() => {
            res.json(images);
          });
      })
      .catch(error => {
        console.error("Failed to retrieve images:", error)
      })
  });

  // GET image by its id
  app.get("/api/images/:imageId", (req: Request, res: Response) => {
    const imageId = req.params.imageId;

     // invalid image id
    if (!ObjectId.isValid(imageId)) {
      res.status(404).send({
        error: "Not Found",
        message: "Image does not exist"
      });
      return;
    }

    imageProvider.getImageById(imageId)
      .then(image => {
        waitDuration(1000)
          .then(() => {
            res.json(image);
          });
      })
      .catch(error => {
        res.status(404).send({
          error: "Not Found",
          message: error.message
        });
      });
  })

  // PUT updates an image's name
  app.put("/api/images/:imageId", (req: Request, res: Response) => {
    const imageId = req.params.imageId;
    const newName = req.body.newName;

    // invalid image id
    if (!ObjectId.isValid(imageId)) {
      res.status(404).send({
        error: "Not Found",
        message: "Image does not exist"
      });
      return;
    }

    // request bad format
    if (!newName) {
      res.status(400).send({
        error: "Bad Request",
        message: "New name not of valid type"
      });
      return;
    }

    // image name too long
    if (newName.length > 100) {
      res.status(422).send({
        error: "Unprocessable Entity",
        message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
      });
      return;
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