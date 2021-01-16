//jshint esversion:6
const express = require("express");
const router = express.Router();
const {check, validationResult} = require("express-validator");

const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

//@route  POST api/posts
//@desc   Create a Post
//@access Private

router.post('/', [
  auth, 
  [
  check('text', 'Text is required').not().isEmpty()
  ] 
], 
async (req,res) => {

  //validate error message 
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array() });
  } else {
    console.log(req.body);
  }

  try {
    //find user 
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post ({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });
    
    const post = await newPost.save();

    res.json(post);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

//@route  GET api/posts
//@desc   Get all posts
//@access Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({date: -1}); //date -1 sort by date created most recent first, date 1 oldest post
    res.json(posts);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  GET api/posts/:id
//@desc   Get post by ID
//@access Private

router.get('/:id', auth, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(!post){
      return res.status(404).json({msg: 'Post not found'});
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg: 'Post not found'});
    }

    res.status(500).send('Server Error');
  }
});

//@route  DELETE api/posts/:id
//@desc   Delete post by user
//@access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(!post) {
      return res.status(404).json({msg: 'Post not found'});
    }

    //check user id if equal to req.user.id
    //toString convert post.user to string
    if(post.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorize'});
    }

    await post.remove();
    res.json({msg: 'Post removed'});


  } catch (err) {
    console.error(err.message);

    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg: 'Post not found'});
    }

    res.status(500).send('Server Error');
  }
});

//@route  PUT api/posts/like/:id
//@desc   Like post by id
//@access Private

router.put('/like/:id', auth, async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    //if post likes is greater than 0 return post already liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked'});
    }

    //push user like on post.likes array
    post.likes.unshift({user: req.user.id});
    await post.save();

    

    res.json(post.likes);

    

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/posts/unlike/:id
//@desc   unLike post by id
//@access Private

router.put('/unlike/:id', auth, async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);


    //check if post is like by a user
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0 ) {
      return res.status(400).json({msg: 'Post has not yet been liked'});
    }

    // find the user to be remove. indexOf(position of the user in array)
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex, 1) //splice remove 1 item
    await post.save();
    res.json(post.likes);


  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//@route  POST api/posts/comment/:id
//@desc   Comment on a post
//@access Private

router.post('/comment/:id', [
  auth, 
  [
  check('text', 'Text is required').not().isEmpty()
  ] 
], 
async (req,res) => {

  //validate error message 
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array() });
  } else {
    console.log(req.body);
  }

  try {
    //find user 
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    //gonna be an objects because comments is an array not individal collection
    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    };

    post.comments.unshift(newComment);
    
    await post.save();

    res.json(post.comments);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

//@route  POST api/posts/comment/:id/:comment_id
//@desc   Delete comment on post
//@access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    //find post first 
    const post = await Post.findById(req.params.id);

    //find comment on post
    //find function returns the value of the first element in an array that pass a test
    const comment = post.comments.find(comment => comment.id === req.params.comment_id)

    //check if comment exist
    if(!comment){
      return res.status(404).json({msg: 'Comment does not exist'});
    }
    
    //check user who comments
    if(comment.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorize'});
    }

    //get remove index
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json(post.comments);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;