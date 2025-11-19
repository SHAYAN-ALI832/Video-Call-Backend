import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userschema = mongoose.Schema({
    Fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio:{
        type: String,
        default: ""
    },
    profilePicture: {
        type: String,
        default: ""
    },
    nativelanguage:{
        type: String,
        default: ""
    },
    learninglanguage:{
        type: String,
        default: ""
    },
    location:{
        type: String,
        default: ""
    },
    isonboarding:{
        type: Boolean,
        default: false
    },
    friends:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

},{timestamps:true})
userschema.pre("save",async function (next){
    if(!this.isModified("password")) return next()

        try{
             const salt = await bcrypt.genSalt(10)
             this.password = await bcrypt.hash(this.password, salt)
             next()
        }
        catch (error) {
            next(error)
        }
})
userschema.methods.comparePassword = async function(enteredpassword)
{
    const ispasswordcorrect =  await bcrypt.compare(enteredpassword,this.password)
    console.log(ispasswordcorrect)
    return ispasswordcorrect
}
const user = mongoose.model("User", userschema)



export default user