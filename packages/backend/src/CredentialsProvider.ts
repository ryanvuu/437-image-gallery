import { Collection, MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    _id: string;
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        const userCreds = await this.collection.findOne({username: username});
        if (userCreds) {
            console.error("Error: user already exists");
            return false;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

        await this.collection.insertOne({
            _id:username,
            username: username,
            password: hashedPassword
        });

        // Wait for any DB operations to finish before returning!
        return true;
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        const user = await this.collection.findOne(
            { _id: username }
        );

        if (!user) {
            console.error("Error: user doesn't exist");
            return false;
        }
        
        return await bcrypt.compare(plaintextPassword, user.password)
    }
}
