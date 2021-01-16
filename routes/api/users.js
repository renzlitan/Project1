//jshint esversion:6
const express = require("express");
const router = express.Router();
const {check,validationResult} = require('express-validator');
const gravatar = require("gravatar");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const config = require("config");

//import User model
const User = require("../../models/User");

//@route  POST api/users
//@desc   Test route
//@access Public

router.post('/', [
  //validate so name cannot be empty
  check('name', 'Name is required')
    .not()
    .isEmpty(),

  check('email', 'Please include a valid email')
    .isEmail(),

  check('password', 'Please enter a password with 6 or more characters')
    .isLength({min: 6})

], async (req, res) => {

  //validation errors showing errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    console.log(req.body);
  }

  const {name, email, password} = req.body;

  try {
    // if user exist
    let user = await User.findOne({ email });
    if(user){
     return res.status(400).json({errors: [{msg: "User already exists"}] });
    }

    //gravatar
    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm"
    })

    user = new User({
      name,
      email,
      avatar,
      password
    });

    //hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();


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