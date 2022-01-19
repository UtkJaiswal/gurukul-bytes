const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'Hello$%789';

//ROUTE 1: Create a User using POST request:"/api/auth/createUser". No authentication required
router.post(
  "/createUser",
  [
    body("email", "Enter a valid E-mail").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success=false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }

    
    try {
      //check whether the user email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success,error: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);//generate salt to make password more secured
      const securedPassword = await bcrypt.hash(req.body.password,salt);
      //create a new user
      user = await User.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth,
        gender: req.body.gender,
        email: req.body.email,
        password: securedPassword,
        address: req.body.address,
        profile_picture: req.body.profile_picture,
      });

      const data = {
        user:{
          id:user.id
        }
      }
      //sign the  token so that any other user cannot login into another users account
      const authToken = jwt.sign(data,JWT_SECRET)
      
      success=true;
      res.json({success,authToken});

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 2: Authenticate a User using POST request "/api/auth/login". No authentication required
router.post('/login',[
  body('email','Enter a valid email').isEmail(),  
  body('password','Password cannot be blank').exists()
],async(req,res)=>{
  let success=false
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()})
  }

  const {email,password} = req.body;
  try {
    let user = await User.findOne({email});
    //check if a user with given email exists or not
    if(!user) {
      success=false
      return res.status(400).json({error:"Please use correct credentials"})
    }
    //compare the password
    
    const passwordCompare = bcrypt.compare(password,user.password);
    //check if password of the user is  correct or not
    if(!passwordCompare) {
      success=false
      return res.status(400).json({success,error:"Please use correct credentials"})
    }
    const data = {
      user:{
        id:user.id
      }
    }
    //sign the  token so that any other user cannot login into another user's account
    const authtoken = jwt.sign(data,JWT_SECRET);
    success=true;
    res.json({success,authtoken})

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

})


//ROUTE 3: Get User details using POST request "/api/auth/getuser". Authentication required
router.post('/getuser',fetchuser,async(req,res)=>{
  
  try {
      
      const userId=req.user.id
      const a = await User.findById(userId)
      
      if(a.email==='admin123@gmail.com'){
        const user = await User.find()
        res.send(user)
      }
      else{
        
        const user = await User.findById(userId)
        
        res.send([user])
        
      }
      
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

})
 

module.exports = router;
