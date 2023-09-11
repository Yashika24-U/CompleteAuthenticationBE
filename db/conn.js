const mongoose = require("mongoose")


const DB = 'mongodb+srv://iamyashikau:yashi25062002@cluster0.w2apayi.mongodb.net/Authuers?retryWrites=true&w=majority'

mongoose.connect(DB,{
    useUnifiedTopology : true,
    useNewUrlParser:true
}).then(()=>console.log("Database connected successfully")).catch((error)=>{console.log(error)})