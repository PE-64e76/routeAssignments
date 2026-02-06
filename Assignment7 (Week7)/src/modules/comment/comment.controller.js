import { Router } from "express";
import * as commentService from "./comment.service.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await commentService.getAllComments();
    return res.status(200).json({ message: "Comments retrieved successfully", result });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving comments", error: error.message });
  }
});

router.get("/newest/:postId", async (req, res, next) => {
  try {
    const result = await commentService.getNewestCommentsByPostId(req.params.postId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/details/:id", async (req, res, next) => {
  try {
    const result = await commentService.getCommentDetailsById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "no comment found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const word = req.query.word;
    const result = await commentService.searchCommentsByWord(word);
    if (result === null) {
      return res.status(404).json({ message: "no comments found." });
    }
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await commentService.getCommentById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ message: "Comment retrieved successfully", result });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving comment", error: error.message });
  }
});

router.get("/post/:postId", async (req, res, next) => {
  try {
    const result = await commentService.getCommentsByPostId(req.params.postId);
    return res.status(200).json({ message: "Comments retrieved successfully", result });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving comments", error: error.message });
  }
});

router.get("/user/:userId", async (req, res, next) => {
  try {
    const result = await commentService.getCommentsByUserId(req.params.userId);
    return res.status(200).json({ message: "Comments retrieved successfully", result });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving comments", error: error.message });
  }
});

router.post("/find-or-create", async (req, res, next) => {
  try {
    const result = await commentService.findOrCreateComment(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const isBulk = Array.isArray(body) || (body && Array.isArray(body.comments));
    if (isBulk) {
      await commentService.createBulkComments(body);
      return res.status(201).json({ message: "comments created." });
    }
    const result = await commentService.createComment(body);
    return res.status(201).json({ message: "Comment created successfully", result });
  } catch (error) {
    return res.status(400).json({ message: "Error creating comment", error: error.message });
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const result = await commentService.updateCommentByOwner(req.params.id, req.body);
    if (result.status === "not_found") {
      return res.status(404).json({ message: "comment not found." });
    }
    if (result.status === "not_authorized") {
      return res.status(403).json({ message: "You are not authorized to update this comment." });
    }
    return res.status(200).json({ message: "Comment updated." });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const result = await commentService.updateComment(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ message: "Comment updated successfully", result });
  } catch (error) {
    return res.status(400).json({ message: "Error updating comment", error: error.message });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
});

export default router;
