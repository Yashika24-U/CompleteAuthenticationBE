const mongoose  = require("mongoose")
const validator  = require("validator")
const  bcrypt = require("bcryptjs") //hash passwords
const jwt = require("jsonwebtoken")

keysecret = "yashikaattherategmaildotcomtend"

const userSchema = new mongoose.Schema({
    fname:{
        type : String,
        required : true,
        trim:true,//removes all the whitespaces
    },
    email:{
        type : String,
        required : true,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not Valid Email")
            }
        }
    },
    password:{
        type : String,
        required : true, 
        minlength : 6
    },
    cpassword:{
        type : String,
        required : true ,
        minlength : 6
    },
    tokens:[
        {
            token :{
                type : String,
                required : true ,  
            }
        }
    ],
    verifytoken:{
        type:String,
    }



});





//hashing
userSchema.pre("save",async function(next){
    //here 12  is no of rounds it should be hashed

    if(this.isModified("password"))
    {
        this.password = await bcrypt.hash(this.password,12)
        this.cpassword = await bcrypt.hash(this.cpassword,12)
    
    }
   
    next();
});

//token generate

userSchema.methods.generateAuthtoken = async function(){
    try{
            //    - `jwt.sign` generates a JWT with a payload containing the user's `_id`.
            //     `keysecret` is the secret key used for signing the JWT.
           //     The JWT expires in 1 day (24 hours) from the current time
        let token23 = jwt.sign({_id:this._id},keysecret,{
            expiresIn : "1d"

        });
        this.tokens = this.tokens.concat({token:token23});
        await this.save();
        return token23;
    }
    catch(error)
    {
        res.status(422).json(error)
    }
}



//creating a model
//users--collection name //userSchema --modelname
const userdb = new mongoose.model("users",userSchema)

module.exports = userdb;