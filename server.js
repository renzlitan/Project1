//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();
const PORT = process.env.PORT || 3000;


app.get('/', (req,res) => {
  res.send("API Running");
})

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
})
