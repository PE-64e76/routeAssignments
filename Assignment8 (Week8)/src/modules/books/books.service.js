import { client } from "../../DB/connection.db.js";

const db = client.db("library");

export const createBooksCollection = async () => {
  const coll = await db.createCollection("books", {
    validator: { title: { $type: "string" } },
  });
  return { created: true, name: coll.collectionName };
};

export const createAuthorsCollection = async () =>
  db.collection("authors").insertOne({ name: "Author" });

export const createLogsCollection = async () => {
  const coll = await db.createCollection("logs", {
    capped: true,
    size: 1024 * 1024,
  });
  return { created: true, name: coll.collectionName };
};

export const createBooksIndex = async () =>
  db.collection("books").createIndex({ title: 1 });

export const insertOneBook = async (data) =>
  db.collection("books").insertOne(data);
export const insertManyBooks = async (data) =>
  db.collection("books").insertMany(data);
export const insertLog = async (data) =>
  db.collection("logs").insertOne({ ...data, createdAt: new Date() });

export const updateBookByTitle = async (title) =>
  db.collection("books").updateOne({ title }, { $set: { year: 2022 } });

export const findBookByTitle = async (title) =>
  db.collection("books").findOne({ title });

export const findBooksByYear = async (from, to) =>
  db
    .collection("books")
    .find({ year: { $gte: from, $lte: to } })
    .toArray();

export const findBooksByGenre = async (genre) =>
  db
    .collection("books")
    .find({ genres: { $in: [genre] } })
    .toArray();

export const skipLimitBooks = async () =>
  db.collection("books").find().sort({ year: -1 }).skip(2).limit(3).toArray();

export const yearIsInteger = async () =>
  db
    .collection("books")
    .find({ year: { $type: "int" } })
    .toArray();

export const excludeGenres = async () =>
  db
    .collection("books")
    .find({ genres: { $nin: ["Horror", "Science Fiction"] } })
    .toArray();

export const deleteBeforeYear = async (year) =>
  db.collection("books").deleteMany({ year: { $lt: year } });

export const aggregate1 = async () =>
  db
    .collection("books")
    .aggregate([{ $match: { year: { $gt: 2000 } } }, { $sort: { year: -1 } }])
    .toArray();

export const aggregate2 = async () =>
  db
    .collection("books")
    .aggregate([
      { $match: { year: { $gt: 2000 } } },
      { $project: { _id: 0, title: 1, author: 1, year: 1 } },
    ])
    .toArray();

export const aggregate3 = async () =>
  db
    .collection("books")
    .aggregate([{ $unwind: "$genres" }])
    .toArray();

export const aggregate4 = async () =>
  db
    .collection("books")
    .aggregate([
      {
        $lookup: {
          from: "logs",
          localField: "_id",
          foreignField: "bookId",
          as: "logs",
        },
      },
    ])
    .toArray();
