import jwt from "jsonwebtoken"

export const verifyToken = async (req, res, next) => {
   try {
     const token = req.headers.authorization.split(" ")[1];
     const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
     if(!decoded){
         return res.json({message:"Invalid token parameters"})
     }
     req.user = decoded;
     next()
   } catch (error) {
       console.log(error)
        return res.json({message: error.message})
   }
}