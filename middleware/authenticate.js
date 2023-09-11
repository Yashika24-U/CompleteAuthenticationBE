const jwt = require("jsonwebtoken")
const userdb = require("../models/userSchema");

const keysecret = "yashikaattherategmaildotcomtend"

const authenticate = async(req,res,next) => {
    try{
        // header becuz i have given token under the header in clientside
        const token = req.headers.authorization;
        // console.log(token)

         // we will get ID here 
        const verifytoken = jwt.verify(token,keysecret)
        // console.log(verifytoken)


    //    with the help of the id we find the user
        const rootUser = await userdb.findOne({_id:verifytoken._id})
        //console.log(rootUser)


        // if there is no  id we throw error
        if(!rootUser)
        {
            throw new Error("user not found")
        }

        req.token = token
        req.rootUser = rootUser
        req.userId = rootUser._id

        next();


     }
    //  if the user  is not verified
    catch(error)
    {
        res.status(401).json({status : 401 , message :"Unauthorized User ,no token provided"})
    }
}

module.exports = authenticate