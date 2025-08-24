import { ObjectId } from "bson";
import { v4 as uuidv4 } from "uuid";

export function generateUuidV4(): string {
  return uuidv4();
}

export function generateMongoObjectId(): string {
  return new ObjectId().toHexString();
}
