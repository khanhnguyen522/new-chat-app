const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const chatController = {
  accessChat: asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json("User ID param is not sent with request!");
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: req.userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );

        res.status(200).send(fullChat);
      } catch (err) {
        return res.status(400).json(err.message);
      }
    }
  }),

  fetchChats: asyncHandler(async (req, res) => {
    try {
      await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updateAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
          });

          res.status(200).json(results);
        });
    } catch (err) {
      return res.status(400).json(err.message);
    }
  }),

  createGroupChat: asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).json({ message: "Please Fill all the feilds" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res
        .status(400)
        .json("More than 2 users are required to form a group chat");
    }

    // console.log(typeof users);
    // console.log(users);

    // console.log(typeof req.user.id);
    // console.log(req.user.id);

    users.push(req.user.id);

    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user.id,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      res.status(200).json(fullGroupChat);
    } catch (err) {
      res.status(400).json(err.message);
    }
  }),

  renameGroup: asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
  }),
};

module.exports = chatController;
