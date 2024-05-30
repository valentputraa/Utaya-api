import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUserLogin = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if(err) return res.sendStatus(403);
        const idUser = decoded.id;
        const user = await User.find({_id: idUser}).select({username: 1});
        res.status(200).json(user);
    });
}

export const storeUsers = async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    //check field
    if(username === undefined || password === undefined || confirmPassword === undefined) {
        res.status(400).json({
            message: {
                username: "require",
                password: "require",
                confirmPassword: "require"
            }
        });
        return;
    }

    //check username uniq
    const checkUsername = await User.find({username: username});
    if(checkUsername[0] !== undefined) {
        res.status(400).json({
            message: "username alredy exists"
        });
        return;
    }

    //check confirm password
    if(password !== confirmPassword ) {
        res.status(400).json({
            message: "password and confirm password not the same"
        });
        return;
    }
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const deletedAt = null;
    const accessToken = null;

    //password hash
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
        username, 
        password: hashPassword, 
        accessToken,
        createdAt, 
        updatedAt,
        deletedAt
    });
   
    try {
        const saveUser = await user.save();
        res.status(201).json(saveUser);
    } catch (error) {
        res.status(400).json({meassage: error.meassage});
    }
}


export const loginUsers = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.find({username: username});

    if(username === undefined || password === undefined) return res.status(400).json({message: {username: "require", password: "require"}});
    const tim = new Date();
    console.log(tim);

    if(user[0] === undefined ) return res.status(404).json({message: 'username not found'});

    const match = await bcrypt.compare(password, user[0].password);

    if(!match) return res.status(400).json({message: "wrong password"});
    
    const id = user[0].id;
    const userName = user[0].username;
    const accessToken = jwt.sign({id, userName}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
    });
    const refreshToken = jwt.sign({id, userName}, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: '1d'
    });
    
    await User.updateOne({
        _id: id
    },
    {
        accessToken: accessToken
    });
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    });
    res.json({accessToken});


}

export const updatePassword = async (req, res) => {
    const { password, newPassword, confirmNewPassword } = req.body;
    if(password === undefined || newPassword === undefined || confirmNewPassword === undefined) return res.status(400).json({message: {password: "require", newPassword: "require", confirmNewPassword: "require"}});
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if(err) return res.sendStatus(403);
        const idUser = decoded.id;
        const user = await User.find({_id: idUser});
        const match = await bcrypt.compare(password, user[0].password);
        
        if(!match) return res.status(400).json({message: 'wrong password'});
        const confirmMatch = newPassword == confirmNewPassword;
        
        if(!confirmMatch) return res.status(400).json({message: 'password not the same'});

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const updatedAt = new Date().toISOString();

        await User.updateOne({
            _id: idUser
        },
        {
            password: hashPassword,
            updatedAt
        });

        res.status(200).json({meassage: 'password has been update'});
    });
}

export const logoutUsers = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if(err) return res.sendStatus(403);
        const idUser = decoded.id;
        await User.updateOne({
            _id: idUser
        },
        {
            accessToken: null
        });
        res.status(200).json({meassage: 'logout success'});
    });
}

export const deleteUsers = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if(err) return res.sendStatus(403);
        const idUser = decoded.id;
        const deletedAt = new Date().toISOString();
        await User.updateOne({
            _id: idUser
        },
        {
            username: null,
            password: null,
            accessToken: null,
            deletedAt

        });
        res.status(200).json({meassage: "account has been deleted"})
    })
}


