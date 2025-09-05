import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
    content: {
        type: String, 
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }
}, {timestamps: true});

const Message = mongoose.model("Message", MessageSchema);
export default Message;