import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import {config} from "dotenv"
import  {Server} from "socket.io"
import http from "http"
import mongoose from "mongoose"
import User from "./models/User/User.model.js"
import Message from "./models/Message/Message.model.js"
import Room from "./models/Room/Room.model.js"
import userRouter from "./routes/userRoutes.js"
import messageRouter from "./routes/messagesRoutes.js"

config();

const port = process.env.PORT;
const uri = process.env.MONGO_URI;
const app = express();
const httpServer = http.createServer(app);
app.use(cors({
    origin: "https://briva-chatmessage.netlify.app",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]
}));
app.use(express.json());
app.use("/user", userRouter);
app.use("/api", messageRouter);

mongoose.connect(uri).then(() => console.log("Connected to database"))

export const io = new Server(httpServer, {
  cors: {
    origin: "https://briva-chatmessage.netlify.app", // your React app URL
    methods: ["GET", "POST"]
  }
});

io.use(async (socket, next) => {
   try {
     const token = socket.handshake.auth.token;
     if(!token){
         console.log('Guest connection');
         socket.user = null;
         return next()
     }
     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
     socket.user = decoded;
     console.log({userID: decoded.id})
     next()
   } catch (error) {
    next(new Error(error))
   }
})
io.on("connection", (socket) => {
    console.log(socket.id + " connected")
    socket.on("enter-room", async ({room}) => {
    await socket.join(room);
       try {
         const roomToEnter = await Room.findOne({roomCode: room});
         if(roomToEnter){
             const length = await roomToEnter.users.push(socket.user.id);
             roomToEnter.save();
             console.log(socket.id, " joined the room: ", room);
            return socket.emit("get-room",{roomId:roomToEnter._id} );
         }
            return socket.emit("noroom", {message: `${room} is not an existing room`});
         
       } catch (error) {
            console.log(error)
       }
    })

    socket.on("create-room", async ({room}) => {
        room = room.split(" ").join("-")
        const roomToEnter = await Room.findOne({roomCode: room});
        await socket.join(room);
        console.log(socket.id, " joind the room: ", room)
        if(!roomToEnter){
            const newRoom = await new Room({
                creator: socket.user.id,
                 roomCode: room, 
                 users: [socket.user.id],
                 messages: []
                });
                
                const savedRoom = await newRoom.save();
                if(!savedRoom){
                    console.log("No room of roomcode: ", room);
                }
            console.log(socket.user.id)
            socket.emit("get-room",{roomId :savedRoom._id});
        }else{
            socket.emit("noroom", {message: `Room ${room} already exists`})
        }
        
    })
    socket.on("leave-room", async (room) => {
        await socket.leave(room);
    })
    socket.on("join-room", async (room) => {
        await socket.join(room)
    })
    socket.on("send-message",async ({message, room, roomCode}) => {
        const newMessage = await new Message({
            content: message,
            author: socket.user.id,
            room: room
        });
        await newMessage.save();
        const savedMessage = await Message.findOne({content: message}).populate("author")
        io.to(roomCode).emit("get-message", savedMessage);
    })
    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected")
    })
})

app.get("/", (req, res) => {
    res.status(200).json({message:"Welcome to the chatMessage API"})
})
httpServer.listen(process.env.PORT, () => console.log(`Server running at ${port}...`))
