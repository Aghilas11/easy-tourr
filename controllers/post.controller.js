const postModel = require("../models/post.model");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readPost = async (req, res) => {
  try {
    const docs = await PostModel.find();
    res.send(docs);
  } catch (err) {
    console.log("error to get data", err);
    res.status(500).send("Internal Server Error").sort({ createdAt: -1 });
  }
};

module.exports.createPost = async (req, res) => {
  const newPost = new postModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.updatePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  const updatedRecord = { message: req.body.message };

  PostModel.findOneAndUpdate(
    { _id: req.params.id },
    { $set: updatedRecord },
    { new: true }
  )
    .then((docs) => res.send(docs))
    .catch((err) => {
      console.log("Update error: " + err);
      res.status(500).send("Internal Server Error");
    });
};

module.exports.deletePost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

    const deletedPost = await PostModel.findByIdAndDelete(req.params.id);

    if (deletedPost) {
      res.send(deletedPost);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    console.log("deletion error", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.id } },
      { new: true }
    ).exec();

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $addToSet: { likes: req.params.id } },
      { new: true }
    ).exec();

    res.send({ post: updatedPost, user: updatedUser });
  } catch (err) {
    return res.status(400).send(err.message || err);
  }
};

module.exports.unlikePost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.id } },
      { new: true }
    );

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $pull: { likes: req.params.id } },
      { new: true }
    );

    res.send({ post: updatedPost, user: updatedUser });
  } catch (err) {
    return res.status(400).send(err.message || err);
  }
};

module.exports.commentPost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    );

    res.send(updatedPost);
  } catch (err) {
    console.error("Error in commentPost:", err);
    return res.status(400).send(err.message || err);
  }
};

module.exports.editCommentPost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

    const post = await PostModel.findById(req.params.id);

    const theComment = post.comments.find((comment) =>
      comment._id.equals(req.body.commentId)
    );

    if (!theComment) return res.status(404).send("Comment not found");

    theComment.text = req.body.text;

    await post.save();

    res.status(200).send(post);
  } catch (err) {
    console.error("Error in editCommentPost:", err);
    return res.status(500).send(err.message || err);
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    );

    res.send(updatedPost);
  } catch (err) {
    console.error("Error in deleteCommentPost:", err);
    return res.status(500).send(err.message || err);
  }
};
