import React from "react";
import styled from "styled-components";
import axios from "axios";
import {BiTrash} from "react-icons/bi";
export default function ClearChat({currentChat, getClearMessageRoute, currentUser, setMessages}){
    const handleClearChat = async () => {
        if (!currentChat) return;
    
        try {
            const response = await axios.post(getClearMessageRoute, {
                from: currentUser._id,
                to: currentChat._id,
            });
    
            if (response.data.success) {
                setMessages([]); // Clear messages in state
            } else {
                console.error("Failed to clear chat");
            }
        } catch (error) {
            console.error("Error clearing chat:", error);
        }
    }
    return <Button onClick={handleClearChat}><h3>Clear Chats</h3><BiTrash /></Button>
}

const Button = styled.button`
h3{
    color: white;
}
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
    font-size: 1.5rem;
    color: white;
}
&:hover{
    background-color: #fc8d8d;
}
`;
