//jshint esversion:6 
const { truncate } = require("lodash");
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  name: {
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
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }

});

const User = mongoose.model('User', usersSchema);

module.exports = User 

