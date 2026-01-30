import { NoteModel } from "../../DB/model/note.model.js";
import mongoose from "mongoose";

export const createNote = async (userId, data) => {
  const note = new NoteModel({ ...data, userId });
  await note.save();
  return { note };
};

export const getPaginatedNotes = async (userId, page, limit) => {
  const skip = (page - 1) * limit;
  const notes = await NoteModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { notes };
};

export const deleteAllNotes = async (userId) => {
  const result = await NoteModel.deleteMany({ userId });
  return { result };
};

export const updateNote = async (userId, noteId, data) => {
  const note = await NoteModel.findById(noteId);
  if (!note) throw new Error("Note not found", { cause: { status: 404 } });
  if (note.userId.toString() !== userId)
    throw new Error("Not authorized", { cause: { status: 403 } });
  Object.assign(note, data);
  await note.save();
  return { note };
};

export const replaceNote = async (userId, noteId, data) => {
  const note = await NoteModel.findById(noteId);
  if (!note) throw new Error("Note not found", { cause: { status: 404 } });
  if (note.userId.toString() !== userId)
    throw new Error("Not authorized", { cause: { status: 403 } });
  note.title = data.title;
  note.content = data.content;
  await note.save();
  return { note };
};

export const updateAllTitles = async (userId, title) => {
  const result = await NoteModel.updateMany({ userId }, { $set: { title } });
  return { result };
};

export const deleteNoteById = async (userId, noteId) => {
  const note = await NoteModel.findById(noteId);
  if (!note) throw new Error("Note not found", { cause: { status: 404 } });
  if (note.userId.toString() !== userId)
    throw new Error("Not authorized", { cause: { status: 403 } });
  await note.deleteOne();
  return { note };
};

export const getNoteById = async (userId, noteId) => {
  const note = await NoteModel.findById(noteId);
  if (!note) throw new Error("Note not found", { cause: { status: 404 } });
  if (note.userId.toString() !== userId)
    throw new Error("Not authorized", { cause: { status: 403 } });
  return { note };
};

export const getNoteByContent = async (userId, content) => {
  const note = await NoteModel.findOne({ userId, content });
  return { note };
};

export const getNotesWithUser = async (userId) => {
  const notes = await NoteModel.find({ userId })
    .select("title userId createdAt")
    .populate({ path: "userId", select: "email" });
  return { notes };
};

export const aggregateNotes = async (userId, title) => {
  const pipeline = [];
  if (userId) {
    pipeline.push({ $match: { userId: new mongoose.Types.ObjectId(userId) } });
  }
  if (title) {
    pipeline.push({ $match: { title: { $regex: title, $options: "i" } } });
  }
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  });
  pipeline.push({ $unwind: "$user" });
  pipeline.push({
    $project: {
      title: 1,
      content: 1,
      createdAt: 1,
      "user.name": 1,
      "user.email": 1,
    },
  });

  const notes = await NoteModel.aggregate(pipeline);
  return { notes };
};
