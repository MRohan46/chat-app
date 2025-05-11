const User = require("../model/userModel");
const bcrypt = require("bcryptjs");

module.exports.register = async (req, res, next) => {
    try{
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({username});
        if (usernameCheck)
            return res.json({msg: "Username Already Taken!", status: false});
        const emailCheck = await User.findOne({email});
        if (emailCheck)
            return res.json({msg: "Email Already Taken!", status: false});
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email, 
            username,
            password: hashedPassword,
        });
        delete user.password;
        return res.json({status: true, user});
        
    } catch(ex){
        next(ex);
    }
};

module.exports.login = async (req, res, next) => {
    try{
        const { username, email, password } = req.body;
        const user = await User.findOne({$or: [{ username: username },{ email: username }]});
        if (!user)
            return res.json({msg: "Incorrect Username or Email!", status: false});
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid)
                return res.json({msg: "Incorrect Password!", status: false});
        delete user.password;
        
        return res.json({status: true, user});
        
    } catch(ex){
        next(ex);
    }
};

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;

        // Update the user's avatar and return the updated document
        const userData = await User.findByIdAndUpdate(
            userId,
            {
                isAvatarImageSet: true,
                avatarImage,
            },
            { new: true } // Ensure the updated document is returned
        );

        // Check if the user data was updated successfully
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send the updated user data back to the frontend
        return res.json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
        });
    } catch (ex) {
        next(ex);
    }
};

module.exports.getAllUsers = async (req, res, next) => {
    try{
        const users = await User.find({ _id: { $ne: req.params.id }}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);
        res.json(users);
    }catch(ex){
        next(ex);
    }
};