import Message from "../models/Message/Message.model.js";
import Room from "../models/Room/Room.model.js";
import express from "express";
import { verifyToken } from "../authFile.js";
import jwt from "jsonwebtoken"

const router =express.Router();


//api/messages/:id
router.get("/messages/:id",verifyToken, async (req, res) => {
   try {
     const messages = await Message.find({room: req.params.id}).select("-id -room -__v ").populate("author");
     res.json(messages);
   } catch (error) {
    res.json({message: error})
   }
})

//api/room/:id
router.get("/room/:id",verifyToken, async (req, res) => {
   try {
     const room = await Room.findById(req.params.id);
     res.json(room);
   } catch (error) {
    res.json({message: error})
   }
})

export default router;