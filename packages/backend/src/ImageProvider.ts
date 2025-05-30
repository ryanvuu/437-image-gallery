import { MongoClient, ObjectId, Collection } from "mongodb";

interface IImageDocument {
  _id: ObjectId;
  src: string;
  name: string;
  authorId: string;
}

export class ImageProvider {
    private collection: Collection<IImageDocument>

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    getAllImages() {
        return this.collection.find().toArray(); // Without any options, will by default get all documents in the collection as an array.
    }

    getAllImagesWithAuthors() {
      return this.collection.aggregate([
        {
          $lookup: {
            from: process.env.USERS_COLLECTION_NAME,
            localField: "authorId",
            foreignField: "_id",
            as: "author"
          }
        },
        {
          $unwind: "$author"
        },
        {
          $addFields: {
            "id": "$_id",
            "author.id": "$author._id"
          }
        },
        {
          $unset: ["_id", "authorId", "author.email", "author._id"]
        },
      ]).toArray()
        .then(results => {
          return results;
        })
    }
}