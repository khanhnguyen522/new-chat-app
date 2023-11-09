const express = require("express");
const userController = require("../controllers/userController");
const middlewareController = require("../controllers/middlewareController");

const router = express.Router();

router.post("/", userController.registerUser);
router.get("/", middlewareController.verifyToken, userController.allUsers);
router.post("/login", userController.loginUser);

module.exports = router;
