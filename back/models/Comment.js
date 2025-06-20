import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming your User model is named 'User'
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null, // Use null for top-level comments
  },
  // If you want to store replies directly within a comment
  // replies: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Comment'
  // }]
});

// Optional: Add an index on author and/or parentComment if you expect to query by them frequently
// commentSchema.index({ author: 1 });
// commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
