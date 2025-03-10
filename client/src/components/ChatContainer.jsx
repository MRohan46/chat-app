import axios from "axios";
import { sendMessageRoute, getMessageRoute, getClearMessageRoute } from "../utils/APIRoutes";
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import ClearChat from "./ClearChat";
import statusOnline from '../assets/statusOnline.png'
import statusOffline from '../assets/statusOffline.jpg'
import moment from "moment";

export default function ChatContainer({ currentChat, currentUser, socket }) {
    const [messages, setMessages] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const scrollRef = useRef();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(statusOffline);
    //const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);


    // Typing Events
    useEffect(() => {
        if (!socket.current || !currentChat) return;
    
        const handleTyping = (senderId) => {
            if (senderId === currentChat._id) setIsTyping(true);
        };
        
        const handleStopTyping = (senderId) => {
            if (senderId === currentChat._id) setIsTyping(false);
        };
        
    
        socket.current.on("user-typing", handleTyping);
        socket.current.on("user-stopped-typing", handleStopTyping);
    
        return () => {
            socket.current.off("user-typing", handleTyping);
            socket.current.off("user-stopped-typing", handleStopTyping);
        };
    }, [currentChat]);    



    // Fetch messages when currentChat changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (currentChat) {
                const response = await axios.post(getMessageRoute, {
                    from: currentUser._id,
                    to: currentChat._id,
                });
    
                // Store messages with fixed timestamps
                const fixedMessages = response.data.map(msg => ({
                    ...msg,
                    fixedCreatedAt: msg.createdAt // Store original createdAt as fixed
                }));
                
    
                setMessages(fixedMessages);
                setLoading(false);
            }
        };
        fetchMessages();
    }, [currentChat]);
    
    
    useEffect(()=>{
        setLoading(true);
    }, [currentChat])

    useEffect(() => {
        if (!socket.current || !currentChat) return;
    
        socket.current.emit("get-online-users");
        socket.current.on("online-users", (users) => {
            users.includes(currentChat._id) ? setStatus(statusOnline) : setStatus(statusOffline);
        });
    
        return () => socket.current.off("online-users"); // Cleanup listener
    }, [currentChat]);

    useEffect(() => {
        if (!socket.current || !currentChat) return;
    
        // Polling function to get online users every 15 seconds
        const interval = setInterval(() => {
            socket.current.emit("get-online-users");
            socket.current.on("online-users", (users) => {
                users.includes(currentChat._id) ? setStatus(statusOnline) : setStatus(statusOffline);
            });
                  
        }, 15000);  // 15 seconds interval
    
        // Cleanup function to clear the interval and remove the event listener
        return () => {
            clearInterval(interval);
            socket.current.off("online-users"); // Cleanup listener
        };
    }, [currentChat]);
    

    // Handle sending messages
    const handleSendMsg = async (msg) => {
        try {
            await axios.post(sendMessageRoute, {
                from: currentUser._id,
                to: currentChat._id,
                message: msg,
            });

            socket.current.emit("send-msg", {
                to: currentChat._id,
                from: currentUser._id,
                message: msg,
            });
            // Update local state immediately
            setMessages((prev) => [...prev, { fromSelf: true, message: msg, createdAt: new Date().toISOString() }]);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Listen for incoming messages
    useEffect(() => {
        if (socket.current && currentChat) {
            const handleMessageReceive = (msg) => {
                if (msg.from === currentChat._id) {
                    setArrivalMessage({ fromSelf: false, message: msg.message, createdAt: msg.createdAt || new Date().toISOString() });                }
            };

            socket.current.on("msg-receive", handleMessageReceive);
            return () => socket.current.off("msg-receive", handleMessageReceive);
        }
    }, [currentChat]);

    // Add arrivalMessage to messages
    useEffect(() => {
        arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage]);

    // Auto-scroll to the latest message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const isOnlyEmojis = (message) => {
        const emojiRegex = /^(\p{Emoji}|\s)+$/u;
        return emojiRegex.test(message);
    };    

    return (
        <Container>
            <div className="chat-header">
                <div className="user-details">
                    <div className="avatar">
                        <div className="profile-pic">
                            <div className="profile-img">
                                <img src={`data:image/svg+xml;base64,${currentChat.avatarImage}`} alt="avatar" />
                            </div>
                            <div className="profile-status">
                                <img src={status} alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="username">
                        <h3>{currentChat.username}</h3>
                    </div>
                    
                </div>
                <ClearChat currentChat={currentChat} getClearMessageRoute={getClearMessageRoute} currentUser={currentUser} setMessages={setMessages}/>
                <Logout socket={socket} />
            </div>
            <div className="chat-messages">
                {loading ? (
                    <div className="loading-text"><p>Loading messages...</p></div>
                ) : messages.length === 0 ? (
                    <div className="loading-text"><p>You have no chats with this person.</p></div>
                ) : (
                    (() => {
                    let lastDate = null;
                    return messages.map((message, index) => {
                        const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
                        const showDate = messageDate !== lastDate;
                        lastDate = messageDate;

                        return (
                        <div key={message._id || uuidv4()} ref={scrollRef}>
                            {/* Show Date Header */}
                            {showDate && (
                            <div className="date-separator">
                                <p>{moment(message.createdAt).format("LL")}</p>
                            </div>
                            )}

                            {/* Chat Message */}
                            <div className={`message ${message.fromSelf ? "sended" : "received"}`}>
                                <div className={`content ${isOnlyEmojis(message.message) ? "emoji-only" : ""}`}>
                                    <p>{message.message}</p>
                                    <span className="message-time">
                                    {moment(message.createdAt || new Date()).format("hh:mm A")}
                                    </span>
                                </div>
                            </div>
                        </div>
                        );
                    });
                    })()
                )}
                </div>
            <ChatInput handleSendMsg={handleSendMsg} socket={socket} currentChat={currentChat} currentUser={currentUser} isTyping={isTyping}/>
        </Container>
    );
}

// ... styled component (same as before)
const Container = styled.div`
    .message-time{
        font-size: 12px;
        font-family: "Josefin Sans", serif;
    }
    .clear-chat{
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: none;
        color: white;
        background-color: #ff6666;
        cursor: pointer;
        transition: .5s;
        &:hover{
            background-color: #fc8d8d;
        }
    }
    display: grid;
    grid-template-rows: 10% 78% 12%;
    gap: 0.1rem;
    overflow: hidden;
    .loading-text{
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        display: flex;
        p{
            font-size: 2rem;
            color: #ff6666;
        }
    }
    .chat-header {
        background-color: #181818;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-top-right-radius: 2rem;

        .user-details {
            display: flex;
            align-items: center;
            gap: 1rem;
            .avatar{
                user-select: none;

                .profile-pic {
                    display: flex;
                    width: 3rem;
                    height: 3rem;
                    background-color: transparent;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .profile-img {
                    height: 3rem;
                    width: 3rem;
                    position: relative;
                }
            
                .profile-img img {
                    border-radius: 50%;
                    width: 100%;
                    height: 100%;
                }
            
                .profile-status {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    transform: translate(300%, 30%);
                }
            
                .profile-status img {
                    position: absolute;
                    border-radius: 50%;
                    height: 15px;
                    width: 15px;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    transform: translate(200%, 20%);
                }
            
                
            }
            .username h3 {
                color: white;
            }
            
            .user-status{
                font-family: 'Noto Color Emoji', sans-serif;
                user-select: none;
            }
        }
        .typing-indicator {
            font-size: 14px;
            color: #ff6666;
            font-style: italic;
            margin-left: 10px;
        }
    }

    .chat-messages {
        padding: 1rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        overflow: auto;
        
        .date-separator{
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .date-separator p{
            color: white;
    
        }
        
        .message {
            display: flex;
            align-items: center;
            font-family: 'Noto Color Emoji', sans-serif;

            .content {
                max-width: 40%;
                overflow-wrap: break-word;
                padding-left: .8rem;
                padding-right:.8rem;
                padding-top: .5rem;
                font-size: 1.1rem;
                border-radius: 1rem;
                color: white;
            }
            .emoji-only p {
                font-size: 5rem; /* Make the emoji large */
                line-height: 1.2;
            }            
        }
        
        .sended {
            justify-content: flex-end;
            .content {
                background-color: #ff6666;
            }
        }
        
        .received {
            justify-content: flex-start;
            
            .content {
                background-color: #333;
            }
        }
        
        .emoji-only{
            background-color: transparent !important;
        }
        
        &::-webkit-scrollbar {
            width: 0.2rem;

            &-thumb {
                background-color: #ff6666;
                width: 0.3rem;
                border-radius: 1rem;
            }
        }
    }

    @media screen and (min-width: 334px) and (max-width: 720px) {
        grid-auto-rows: 5% 90% 5%;
    }
`;