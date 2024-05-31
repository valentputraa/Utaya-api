import mongoose, { Types } from "mongoose";

const User = mongoose.Schema({
    username:{
        type: String,
        required: true,
        index: { unique: true, dropDups: true }
    },
    password:{
        type: String,
        required: true
    },
    refreshToken:{
        type: String,
        required: false
    },
    createdAt:{
        type: String,
        required: false
    },
    updatedAt:{
        type: String,
        required: false
    },
    deletedAt:{
        type: String,
        required: false
    }
});

export default mongoose.model('Users', User);