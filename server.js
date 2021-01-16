//jshint esversion:6

const express = require("express");
// const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;



//connect database
connectDB();

//init middleware (to use body parser)
app.use(express.json({extended:false}));
// app.use(bodyParser.urlencoded({extended:true}));

app.get('/test', (req,res) => {
  res.send("API Running");
})

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
})


// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

