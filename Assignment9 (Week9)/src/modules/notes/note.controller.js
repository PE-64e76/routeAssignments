import { Router } from "express";
import * as service from "./node.service.js";
import { auth } from "../auth/auth.middleware.js";

const router = Router();

// Create a note
router.post("/", auth, async (req, res, next) => {
  try {
    const result = await service.createNote(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// Replace entire note
router.put("/replace/:noteId", auth, async (req, res, next) => {
  try {
    const result = await service.replaceNote(
      req.user.userId,
      req.params.noteId,
      req.body,
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Update title of all user's notes
router.patch("/all", auth, async (req, res, next) => {
  try {
    const result = await service.updateAllTitles(
      req.user.userId,
      req.body.title,
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Paginated sorted notes
router.get("/paginate-sort", auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page ?? "1");
    const limit = parseInt(req.query.limit ?? "10");
    const result = await service.getPaginatedNotes(
      req.user.userId,
      page,
      limit,
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Get a note by content
router.get("/note-by-content", auth, async (req, res, next) => {
  try {
    const result = await service.getNoteByContent(
      req.user.userId,
      req.query.content,
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Get notes with user info (title, userId, createdAt) and user's email
router.get("/note-with-user", auth, async (req, res, next) => {
  try {
    const result = await service.getNotesWithUser(req.user.userId);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Aggregation with title search (public - works without token)
router.get("/aggregate", async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const result = await service.aggregateNotes(userId, req.query.title);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Delete all notes for logged-in user
router.delete("/", auth, async (req, res, next) => {
  try {
    const result = await service.deleteAllNotes(req.user.userId);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Update a single note by id (owner only)
router.patch("/:noteId", auth, async (req, res, next) => {
  try {
    const result = await service.updateNote(
      req.user.userId,
      req.params.noteId,
      req.body,
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Delete single note (owner only)
router.delete("/:noteId", auth, async (req, res, next) => {
  try {
    const result = await service.deleteNoteById(
      req.user.userId,
      req.params.noteId,
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// Get a note by id (owner only) - placed after specific routes to avoid collision
router.get("/:id", auth, async (req, res, next) => {
  try {
    const result = await service.getNoteById(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
