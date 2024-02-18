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
    res.status(500).send("Internal Server Error");
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
