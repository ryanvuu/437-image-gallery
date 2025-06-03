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

    async getAllImages() {
        return this.collection.find().toArray(); // Without any options, will by default get all documents in the collection as an array.
    }

    async getImageById(imageId: string) {
      const matchObjId = new ObjectId(imageId);
      return this.collection.findOne({_id: matchObjId});
    }

    async getAllImagesWithAuthors(searchQuery?: string) {
      const matchStage: any = {};

      if (searchQuery !== "") {
        // regex matches to searchQuery, option "i" indicates a case-insensitive search
        matchStage.name = { $regex: searchQuery, $options: 'i' }
        console.log(matchStage);
      }

      return this.collection.aggregate([
        ...(Object.keys(matchStage).length > 0 ? [ { $match: matchStage } ] : []),
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

    async updateImageName(imageId: string, newName: string): Promise<number> {
      // Do keep in mind the type of _id in the DB is ObjectId
      const matchObjId = new ObjectId(imageId);
      return this.collection.updateOne({_id: matchObjId}, {$set: {name: newName}})
        .then(updatedDoc => {
          return updatedDoc.matchedCount;
        });
    }

    async getImageOwner(imageId: string): Promise<string | null> {
      const image = await this.getImageById(imageId);
      return image ? image.authorId : null;
    }
}