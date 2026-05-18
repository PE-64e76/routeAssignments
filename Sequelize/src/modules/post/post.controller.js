import { Router } from "express";
import * as postService from "./post.service.js";

const router = Router();


router.get("/", async (req, res, next) => {
  try {
    const result = await postService.getAllPosts();
    return res.status(200).json({ message: "Posts retrieved successfully", result });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving posts", error: error.message });
  }
});

router.get("/details", async (req, res, next) => {
  try {
    const result = await postService.getPostsWithDetails();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/comment-count", async (req, res, next) => {
  try {
    const result = await postService.getPostsWithCommentCount();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await postService.getPostById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({ message: "Post retrieved successfully", result });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving post", error: error.message });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const result = await postService.createPost(req.body);
    return res.status(201).json({ message: "Post created successfully", result });
  } catch (error) {
    return res.status(400).json({ message: "Error creating post", error: error.message });
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const result = await postService.updatePost(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({ message: "Post updated successfully", result });
  } catch (error) {
    return res.status(400).json({ message: "Error updating post", error: error.message });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await postService.deletePost(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});

export default router;
