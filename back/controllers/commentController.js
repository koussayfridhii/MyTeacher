import Comment from "../models/Comment.js";
import User from "../models/User.js";
// import asyncHandler from '../middleware/async.js'; // Assuming asyncHandler would also be ES6

// @desc    Get all comments
// @route   GET /api/comments
// @access  Private (Admin, Coordinator)
export const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find()
      .populate("author", "firstName lastName email role")
      .populate({
        path: "parentComment",
        populate: { path: "author", select: "name email role" },
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private (Admin, Coordinator)
export const createComment = async (req, res, next) => {
  try {
    const { text, parentComment } = req.body;
    const author = req.user.id;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Text is required" });
    }

    const comment = await Comment.create({
      text,
      author,
      parentComment: parentComment || null,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email role")
      .populate({
        path: "parentComment",
        populate: { path: "author", select: "name email role" },
      });

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author of comment or Admin)
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: `Comment not found with id of ${req.params.id}`,
      });
    }

    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment (edit text)
// @route   PUT /api/comments/:id
// @access  Private (Author only)
export const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: `Comment not found with id of ${req.params.id}`,
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this comment",
      });
    }

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Text is required for update" });
    }

    comment.text = text;
    // Optionally, update an 'editedAt' timestamp if you add one to the schema
    // comment.editedAt = Date.now();
    await comment.save();

    // Repopulate to send back the full comment with author details
    comment = await Comment.findById(comment._id)
      .populate("author", "name email role")
      .populate({
        path: "parentComment",
        populate: { path: "author", select: "name email role" },
      });

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};
