import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.svg';
import { ToastContainer, toast} from 'react-toastify';
import axios from 'axios';
import { registerRoute } from '../utils/APIRoutes';

function Register() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    
    const ToastOptions = {
      position: "top-right",
      autoClose: 8000,
      pauseOnHover: true,
      theme: "dark",
    }

    useEffect(() =>{
      if(localStorage.getItem('chat-app-user')){
        navigate("/");
      }
    }, [])
    const handleSubmit = async (event)=>{
      event.preventDefault();
    if (handleValidation()){
      const { password, email, username } = values;
      const { data } = await axios.post(registerRoute, {
        username,
        email,
        password,
      });
      if(data.status === false){
        toast.error(data.msg, ToastOptions);
      };
      if(data.status === true){
        localStorage.setItem("chat-app-user", JSON.stringify(data.user));
        navigate("/");
      };
      
    }
    };
    const handleChange = (event)=>{ 
      setValues({...values,[event.target.name]:event.target.value })
    };

    const handleValidation = () => {
      const { password, confirmPassword, email, username } = values;
      if(password !== confirmPassword){
        toast.error("Password does not match with Confirm Password!" , ToastOptions);
        return false;
      } else if (username.length < 3 || username.length > 14){
        toast.error("Username should be 3 to 14 characters long!" , ToastOptions);
        return false;
      } else if (password.length < 8){
        toast.error("Password should be atleast 8 characters long!" , ToastOptions);
        return false;
      } else if (email===""){
        toast.error("Please enter an Email Address!", ToastOptions);
        return false;
      }
      return true;
    };
  return (
    <>
      <FormContainer>
        <form onSubmit={(event)=>handleSubmit(event)}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <span>River Wave Solutions.</span>
          </div>
          <input 
            type="text" 
            placeholder='Username'
            name='username'
            onChange={e=>handleChange(e)}
          />
          <input 
            type="email" 
            placeholder='Email'
            name='email'
            onChange={e=>handleChange(e)}
          />
          <input 
            type="password" 
            placeholder='Password'
            name='password'
            onChange={e=>handleChange(e)}
          />
          <input 
            type="password" 
            placeholder='Confirm Password'
            name='confirmPassword'
            onChange={e=>handleChange(e)}
          />
          <button type='submit'>
            <span className="text-container">
              <span className="text">Register</span>
            </span>
          </button>
          <span className='spantext'>Already have and account? <Link to="/login">Login</Link></span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #fc5858;
  .brand{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    img{
      height: 3rem;
      border-radius: 5rem;
    }
    span{
      color: #ff6666;
      text-transform: uppercase;
      font-size: 1.3rem;
      font-weight: 800;
    }
  }
  form{
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #fff;
    border-radius: 2rem;
    padding: 3rem 5rem;
    max-width: 500px;
    input{
      background-color: transparent;
      padding: 0.5rem;
      border: 0.2rem solid #697565;
      border-radius: 0.2rem;
      color: #333;
      width: 100%;
      font-size: 1rem;
      &:focus{
        border: 0.2rem solid #ff6666;
        outline: none;
        background-color: #ff6666;
      }
      transition: .5s;
    }
    input:not(:placeholder-shown) {
      border-color: #fc5858;
    }
    button,
    button *,
    button :after,
    button :before,
    button:after,
    button:before {
      border: 0 solid;
      box-sizing: border-box;
    }
    button {
      -webkit-tap-highlight-color: transparent;
      -webkit-appearance: button;
      background-color: #ff6666  ;
      background-image: none;
      color: #f72a2a ;
      cursor: pointer;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
        Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,
        Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
      font-size: 100%;
      font-weight: 900;
      line-height: 1.5;
      margin: 0;
      -webkit-mask-image: -webkit-radial-gradient(#000, #fff);
      padding: 0;
      text-transform: uppercase;
    }
    button:disabled {
      cursor: default;
    }
    button:-moz-focusring {
      outline: auto;
    }
    button svg {
      display: block;
      vertical-align: middle;
    }
    button [hidden] {
      display: none;
    }
    button {
      border-radius: 99rem;
      border-width: 2px;
      overflow: hidden;
      padding: 0.8rem 3rem;
      position: relative;
    }
    button span {
      
      color: #333;
    }
    button:before {
      background: #f72a2a;
      content: "";
      display: block;
      height: 100%;
      left: -100%;
      position: absolute;
      top: 0;
      transform: skew(0deg) translateX(-20%);
      transition: transform 0.2s ease;
      width: 120%;
      z-index: -9999;
    }
    button:hover:before{
      transform: skew(45deg) translateX(75%);
    }

    span{
      color: #333;
      text-transform: uppercase;
      a{
        text-decoration: none;
        color: #ff6666;
        transition: .3s;
      }
      a:hover{
        color: #f72a2a;
      }
    }
  }
`;

export default Register;