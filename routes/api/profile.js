//jshint esversion:6
const express = require("express");
const request = require('request');
const config = require("config");
const router = express.Router();
const {check, validationResult} = require("express-validator");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { route } = require("./users");

//@route  GET api/profile/me
//@desc   get current users profile
//@access Private

router.get('/me', auth, async (req,res) => {
  try{

    //find id of the user with relation then populate with name and avatar
    const profile = await Profile.findOne({user: req.user.id}).populate("user", ["name", "avatar"]); 

    if(!profile){
      return res.status(400).json({msg: "There is no profile for this user"});
    }
  
    res.json(profile);

  } catch(err){
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});


//@route  POST api/profile
//@desc   create or update a user profile
//@access Private

router.post('/', [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty()
    ]
  ], 
  async (req,res,next) => {

    //validate error message
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({errors: errors.array() });
    } else {
      console.log(req.body);
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = req.body;

    //build profile object
    const profileFields = {};

    //add id of profile to user id
    profileFields.user = req.user.id;

    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(status) profileFields.status = status;
    if(bio) profileFields.bio = bio;
    if(githubusername) profileFields.githubusername = githubusername;

    //for splitting array into object
    //map() same as foreach
    if(skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    //build profile social object
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({user: req.user.id});

      if(profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          {user: req.user.id}, //what to find (id)
          {$set: profileFields}, //what to update
          {useFindAndModify: false} //options
          );

        return res.json(profile);
      } 
      

      //create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
        
  } 

});

//@route  GET api/profile
//@desc   get all profiles
//@access Public

router.get('/', async (req,res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch(err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route  GET api/profile/user/:user_id
//@desc   get profile by user id
//@access Public

router.get('/user/:user_id', async (req,res) => {
  try {
    const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

    if(!profile) return res.status(400).json({msg: "Profile not found"});
    
    res.json(profile);

  } catch(err) {
    console.error(err.message);
    //kapag nireplace un id na wala naman id na ganon initialize this instead server error
    if(err.kind == "ObjectId"){
      return res.status(400).json({msg: "Profile not found"});
    }
    res.status(500).send("Server Error");
  }
});


//@route  Delete api/profile
//@desc   Delete profile, user and posts
//@access Private

router.delete('/', auth, async (req,res) => {
  try {
    //remove profile
    await Profile.findOneAndRemove({user: req.user.id});
    //remove user
    await User.findOneAndDelete({_id: req.user.id});

    //@to do remove posts

    res.json({msg: "User Deleted"});

  } catch(err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


//@route  PUT api/profile/experience
//@desc   Add profile experience
//@access Private

router.put('/experience', [
  auth, 
  [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
  ]
], async (req,res) => {
  
  //validation results
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array() });
  } else {
    console.log(req.body);
  }

  //destructuring
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({user: req.user.id});
    //unshift push newexp in profile.experience array
    profile.experience.unshift(newExp);
    await profile.save();
    console.log(profile);
    res.json(profile);


  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
 

});

//@route  DELETE api/profile/experience/:experience_id
//@desc   Delete experience from profile
//@access Private

router.delete('/experience/:exp_id', auth, async (req,res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id});

    //get remove index
    //for each item id (indexOf) return the position of the id 
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/profile/education
//@desc   Add profile education
//@access Private

router.put('/education', [
  auth, 
  [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
  ]
], async (req,res) => {
  
  //validation results
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array() });
  } else {
    console.log(req.body);
  }

  //destructuring
  const {
    school,
    degree,
    fieldtostudy,
    from,
    to,
    current,
    description
  } = req.body;

  const newEducation = {
    school,
    degree,
    fieldtostudy,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({user: req.user.id});
    //unshift push newexp in profile.experience array
    profile.education.unshift(newEducation);
    await profile.save();
    console.log(profile);
    res.json(profile);


  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
 

});


//@route  DELETE api/profile/education/:education_id
//@desc   Delete education from profile
//@access Private

router.delete('/education/:education_id', auth, async (req,res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id});

    //get remove index
    //for each item id (indexOf) return the position of the id 
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.education_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//GITHUB REPOS GET

//@route  GET api/profile/github/:username
//@desc   Get user repos from github
//@access Public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    };

    request(options, (error, response, body) => {
      if(error) console.error(error);

      if(response.statusCode !== 200) {
       return res.status(404).json({msg: "No Github Profile found"});
      }

      res.json(JSON.parse(body));
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})



module.exports = router;