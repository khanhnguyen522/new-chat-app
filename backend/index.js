const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const bodyParser = require("body-parser");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/v1/user", userRoutes);
app.use("/v1/chat", chatRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, console.log(`Server started on PORT ${PORT}`));
