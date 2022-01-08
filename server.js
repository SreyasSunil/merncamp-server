import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { readdirSync } from "fs";

require("dotenv").config();

const morgan = require("morgan");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    path: "/socket.io",
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-type"],
    },
});

// db

mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        // useFindAndModify: false,
        useUnifiedTopology: true,
        // useCreateIndex: true,
    })
    .then(() => console.log("DB CONNECTED"))
    .catch((err) => console.log("DB CONNECTION ERROR ==>", err));

// middleWare
app.use(
    express.json({
        limit: "5mb",
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: [process.env.CLIENT_URL],
    })
);

//autoload routes
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

// Socket.io
// io.on("connect", (socket) => {
//     // console.log("socket.io ==>", socket.id)
//     socket.on("send-message", (message) => {
//         // console.log("new msg received", msg);
//         socket.broadcast.emit("receive-message", message);
//     });
// });

io.on("connect", (socket) => {
    //     // console.log("socket.io ==>", socket.id)
    socket.on("new-post", (newPost) => {
        // console.log(" socket new post==>", newPost);
        socket.broadcast.emit("new-post", newPost);
    });
});

const port = process.env.PORT || 8000;

http.listen(port, () => console.log(`Server running on port ${port}`));
