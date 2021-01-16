//jshint esversion:6
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth"); 
const User = require('../../models/User');
const {check,validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const config = require("config");



//@route  GET api/auth
//@desc   get the user
//@access Public

//to make this route protected using middleware  
router.get('/', auth, async (req,res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);

  } catch(err){
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


//@route  POST api/auth
//@desc   login/Authenticate user & get token
//@access Public

router.post('/', [
 
// login validation
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()

], async (req, res) => {

  //validation errors showing errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    console.log(req.body);
  }


  const {email, password} = req.body;

  try {
    // if user not exist
    let user = await User.findOne({ email });
    if(!user){
     return res.status(400).json({errors: [{msg: "Invalid Credentials"}] });
    } 

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      return res.status(400).json({errors: [{msg: "Invalid Credentials"}] });
    }

  
    //jsonwebtoken
    const payload = {
      user: {
        id: user.id,
      }
    }

    jwt.sign(
      payload, 
      config.get("jwtToken"), //secret token check default.json 
      { expiresIn: 360000}, //token expiration if deploying change to 3600
      (err, token) => {
        if(err) throw err; //if error throw an error
        res.json({token}); // else json token
    
      });


  } catch(err){
    console.error(err.message);
    return res.status(500).send("Server Error")
  } 

})


module.exports = router;