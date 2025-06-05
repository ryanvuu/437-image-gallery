import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";
import { handleImageFileErrors, imageMiddlewareFactory } from "../imageUploadMiddleware";

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
  });

  // PUT updates an image's name
  app.put("/api/images/:imageId", async (req: Request, res: Response): Promise<any> => {
    const imageId = req.params.imageId;
    const newName = req.body.newName;
    const user = req.user?.username;

    if (!user) {
      return res.status(400).send({
        error: "Bad Request",
        message: "User not logged in"
      });
    }

    // invalid image id
    if (!ObjectId.isValid(imageId)) {
      return res.status(404).send({
        error: "Not Found",
        message: "Image does not exist"
      });
    }

    // request bad format
    if (!newName) {
      return res.status(400).send({
        error: "Bad Request",
        message: "New name not of valid type"
      });
    }

    // image name too long
    if (newName.length > 100) {
      return res.status(422).send({
        error: "Unprocessable Entity",
        message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
      });
    }

    imageProvider.getImageOwner(imageId)
      .then(authorId => {
        if (!authorId) {
          return res.status(404).send({
            error: "Image not found"
          });
        }

        if (authorId !== user) {
          return res.status(403).send({
            error: "Forbidden",
            message: "Not the image owner"
          })
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
      .catch(error => {
        console.error("Failed to update image name:", error);
        return res.status(500).send();
      });
  });

  app.post(
    "/api/images",
    imageMiddlewareFactory.single("image"),
    handleImageFileErrors,
    async (req: Request, res: Response): Promise<any> => {
        // Final handler function after the above two middleware functions finish running
        if (!req.file || !req.body.name) {
          return res.status(400).send("Missing an image and/or image name");
        }

        if (!req.user || typeof req.user.username !== "string") {
          return res.status(400).send("Invalid user.");
        }

        const imageDoc = {
          src: `/uploads/${req.file?.filename}`,
          name: req.body.name,
          authorId: req.user.username
        }

        imageProvider.createImage(imageDoc)
          .then(() => {
            res.status(201).send();
          })
          .catch(() => {
            res.status(500).send("Failed to create image, network error.");
          });
    }
  );
}

function waitDuration(numMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, numMs));
}