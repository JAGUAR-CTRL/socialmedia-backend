import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        unique: true,
        required: true
    },
    password: {
        type:String,
        min: 6,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;