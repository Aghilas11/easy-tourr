const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.userInfo = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

    const user = await UserModel.findById(req.params.id).select("-password");

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("Utilisateur non trouvé");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID inconnu : " + req.params.id);

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).send("Utilisateur non trouvé");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    const result = await UserModel.deleteOne({ _id: req.params.id }).exec();

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "successfully deleted." });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    // add to the follower list
    const userToUpdate = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );

    // add to following list
    const userToFollow = await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    res.status(201).json({ userToUpdate, userToFollow });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  )
    return res.status(400).send("ID inconnu : " + req.params.id);

  try {
    // add to the follower list
    const userToUpdate = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } },
      { new: true, upsert: true }
    );

    // add to following list
    const userToUnfollow = await UserModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    res.status(201).json({ userToUpdate, userToUnfollow });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
