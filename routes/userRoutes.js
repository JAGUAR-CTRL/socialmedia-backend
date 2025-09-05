import express from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import User from "../models/User/User.model.js";
import { verifyToken } from "../authFile.js";
import Room from "../models/Room/Room.model.js";

const router = express.Router();

//POST     /user/signup
router.post("/signup", async (req, res) => {
   try {
     const {username, password, gender} = req.body;
     const savedPassword = await bcrypt.hash(password, 10);
     const newUser = new User({username, password: savedPassword, gender});
     const savedUser = await newUser.save();
    const token = await jwt.sign({id: savedUser._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: '3d'
    });

    res.status(200).json({token:token});
   } catch (error) {
    res.json({error: error.message});
    console.log(error);
   }
})

//     /user/login
router.post("/login", async (req, res) => {
   try {
     const {username, password } = req.body;
     const existingUser = await User.findOne({username});
      if(!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
        return res.json({message:"Invalid user credentials"})
      }
    const token = await jwt.sign({id: existingUser._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: '3d'
    });

    res.status(200).json({token:token});
   } catch (error) {
    res.json({error: error.message});
    console.log(error);
   }
})

router.get("/", verifyToken, async(req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
} )

router.get("/recent-rooms",verifyToken, async  (req, res) => {
  const {limit, page, sortBy} = req.query;
  
  const rooms = await Room.find({
    users: req.user.id
  }).sort({
    favorites: -1,
    updatedAt:-1
  }).limit(10);
   res.json(rooms);
});

router.delete("/room/:id",verifyToken, async  (req, res) => {
  await Room.findByIdAndDelete(req.params.id, {
    new: true
  });

  const rooms = await Room.find({
    users: req.user.id
  }).sort({
    favorites: -1,
    updatedAt:-1
  }).limit(10);
  res.json(rooms);

});

router.put("/toggle-favorite", verifyToken, async (req, res) => {
  const {roomId} = req.body;
  const room = await Room.findById(roomId);
  if(room.favorites.includes(req.user.id)){
    room.favorites = room.favorites.filter(favId => {
      favId !== req.user.id;
    })
  }else{
    room.favorites.push(req.user.id);
  }

  await room.save();
  const rooms = await Room.find({
    users: req.user.id
  }).sort({
    favorites: -1,
    updatedAt:-1
  }).limit(10);
  res.json(rooms);
})

export default router;
