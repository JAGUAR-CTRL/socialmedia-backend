import mongoose, { mongo } from "mongoose"

const roomSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    roomCode: {
        type:String, 
        required:true,
        max: 6,
        min: 5
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
}, {timestamps: true});

const Room = mongoose.model("Room", roomSchema);
export default Room;