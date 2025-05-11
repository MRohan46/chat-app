import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import {BiPowerOff} from "react-icons/bi";
export default function Logout({socket}){
    const navigate = useNavigate();
    const handleClick = async () => {
        const user = JSON.parse(localStorage.getItem("chat-app-user"));
        if (user) {
            socket.current.emit("user-logout", user._id);         
            localStorage.clear();
            navigate("/Login");
        }
    }
    return <Button onClick={handleClick}><BiPowerOff /></Button>
}

const Button = styled.button`
display: flex;
justify-content: center;
align-items: center;
padding: 0.5rem;
border-radius: 0.5rem;
border: none;
background-color: #ff6666;
cursor: pointer;
transition: .5s;
svg{
    font-size: 1.3rem;
    color: #ebe7ff;
}
&:hover{
    background-color: #fc8d8d;
}
`;
