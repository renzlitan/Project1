import React, {Fragment, useState} from 'react';
// import axios from "axios";
import {Link} from "react-router-dom";

function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const {email, password} = formData;

  //... spread operator to insert name, email,password, password2
  //e = event

  
  const onChange = e => setFormData({...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async e => {
  e.preventDefault(); //to prevent refresh page
   
      
      console.log("Success");
      // const newUser = {
      //   name,
      //   email,
      //   password,
      // }

      // try {
      //   const config = {
      //     headers: {
      //       'Content-Type': 'application/json'
      //     }
      //   }

      //   const body = JSON.stringify(newUser);

      //   //axios a promise making a post request on our backend api
      //   //2nd param body the data , 3rd param config
      //   const res = await axios.post('/api/users', body, config);
      //   console.log(res.data);
        
      // } catch (err) {
      //   console.error(err.res.data);
      // }

    
  }
  
  return <Fragment>
    <h1 className="large text-primary">Sign In</h1>
      <p className="lead"><i className="fas fa-user"></i> Login your Account</p>
      <form className="form" onSubmit= {e=> onSubmit(e)}>
        
        <div className="form-group">
          <input
            type="email" 
            placeholder="Email Address" 
            name="email" 
            value = {email}
            onChange = {e =>onChange(e)}

            />
          <small className="form-text"
            >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small
          >
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value = {password}
            onChange = {e => onChange(e)}
          />
        </div>
        
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
      
  </Fragment>
    
  
}

export default Login
