import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { allUsersRoute, host } from '../utils/APIRoutes';
import Contacts from '../components/contacts';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from 'socket.io-client';

export default function Chat() {
    const socket = useRef();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [currentChat, setCurrentChat] = useState(undefined);

    useEffect(() => {
        const fetchUser = async () => {
            if (!localStorage.getItem("chat-app-user")) {
                navigate("/Login");
            } else {
                setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            if (!socket.current) {  // Check if socket is not already initialized
                socket.current = io(host, {
                    withCredentials: true,  // Ensure credentials are sent
                });
    
                socket.current.emit("add-user", currentUser._id);
            }
        }
    
        return () => {
            if (socket.current) {
                socket.current.disconnect();  // Clean up socket when component unmounts or currentUser changes
            }
        };
    }, [currentUser]);
    
    useEffect(() => {
        const fetchContacts = async () => {
            if (currentUser) {
                if (currentUser.isAvatarImageSet) {
                    try {
                        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
                        setContacts(data.data);
                    } catch (error) {
                        console.error("Error fetching contacts:", error);
                    }
                } else {
                    navigate("/setAvatar");
                }
            }
        };
    
        fetchContacts();
    }, [currentUser]);    

    const handleChatChange = (chat) => {
        setCurrentChat(chat);
    };

    return (
        <Container>
            <div className="container">
                <Contacts contacts={contacts} currentUser={currentUser} changeChat={handleChatChange} socket={socket}/>
                {currentChat === undefined ? (
                    <Welcome currentUser={currentUser} />
                ) : (
                    <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket} />
                )}
            </div>
        </Container>
    );
}

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    background-color: #ff6666;

    .container {
        border-radius: 2rem;
        height: 85vh;
        width: 85vw;
        background-color: #080808;
        display: grid;
        grid-template-columns: 25% 75%;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
            grid-template-columns: 35% 65%;
        }
    }
`;