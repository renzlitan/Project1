const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
  //get token header
  const token = req.header("x-auth-token");

  //check if not
  if(!token){
    return res.status(401).json({ msg: "No token, authorization denied"})
  }

  //verify token
  try {

    const decoded = jwt.verify(token, config.get("jwtToken"));
    req.user = decoded.user; //decoded.user  (decode thee user at payload)
    next();

  } catch(err) {
    res.status(401).json({ msg: "Token is not valid"});
  }

}