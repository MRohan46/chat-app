import axios from "axios";
import { sendMessageRoute, getMessageRoute, getClearMessageRoute, markReadRoute } from "../utils/APIRoutes";
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import ClearChat from "./ClearChat";
import statusOnline from '../assets/statusOnline.png'
import statusOffline from '../assets/statusOffline.jpg'
import moment from "moment";
import { BiReply, BiCheck, BiCheckDouble } from "react-icons/bi";

export default function ChatContainer({ currentChat, currentUser, socket }) {

    const [messages, setMessages] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(statusOffline);
    const [isTyping, setIsTyping] = useState(false);
    const [aReplyMessage, setAReplyMessage] = useState(null);
    const [replyMessage, setReplyMessage] = useState(null);
    const scrollRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [showToolTip, setShowToolTip] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messageStatus, setMessageStatus] = useState(null);
    

    // Save scroll position when leaving chat
    useEffect(() => {
        return () => {
            localStorage.setItem(`scrollPosition-${currentChat._id}`, chatContainerRef.current?.scrollTop || 0);
        };
    }, [currentChat]);

    // Restore scroll position when resuming chat
    useEffect(() => {
        const restoreScroll = () => {
            const container = chatContainerRef.current;
            if (!container) return;
    
            const savedScroll = localStorage.getItem(`scrollPosition-${currentChat._id}`);
            const wasAtBottom = localStorage.getItem(`wasAtBottom-${currentChat._id}`) === "true";
    
            if (wasAtBottom) {
                // 🔥 Smooth Scroll to Bottom
                container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
            } else if (savedScroll !== null) {
                // 🔵 Restore previous position smoothly
                const scrollTarget = parseInt(savedScroll, 10);
    
                let start = container.scrollTop;
                let duration = 300; // 0.3s animation
                let startTime = performance.now();
    
                const animateScroll = (timestamp) => {
                    let elapsed = timestamp - startTime;
                    let progress = Math.min(elapsed / duration, 1);
                    let easeProgress = progress < 0.5 
                        ? 2 * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease-in-out effect
    
                    container.scrollTop = start + (scrollTarget - start) * easeProgress;
    
                    if (progress < 1) {
                        requestAnimationFrame(animateScroll);
                    }
                };
    
                requestAnimationFrame(animateScroll);
            }
        };
    
        setTimeout(restoreScroll, 50);
    }, [messages]); // Runs when messages change
    
    // ✅ Save Scroll Position & Whether User Was At Bottom
    useEffect(() => {
        const saveScroll = () => {
            if (!chatContainerRef.current) return;
            const container = chatContainerRef.current;
            const scrollTop = container.scrollTop;
    
            // 🔥 NEW: Save if user was actually at the bottom
            const isUserAtBottom = scrollTop + container.clientHeight >= container.scrollHeight - 10;
            localStorage.setItem(`wasAtBottom-${currentChat._id}`, isUserAtBottom.toString());
    
            localStorage.setItem(`scrollPosition-${currentChat._id}`, scrollTop);
        };
    
        return () => saveScroll();
    }, [currentChat]);
    
    
    // Detect if user is at the bottom
    useEffect(() => {
        const handleScroll = () => {
            const container = chatContainerRef.current;
            if (!container) return;
    
            const scrollTop = container.scrollTop;
            
            localStorage.setItem(`scrollPosition-${currentChat._id}`, scrollTop);
            
        };
    
        const chatContainer = chatContainerRef.current;
        chatContainer?.addEventListener("scroll", handleScroll);
    
        return () => chatContainer?.removeEventListener("scroll", handleScroll);
    }, [currentChat]);
    
    

    

    // Replying Function
    const handleReply = (messageId, message, sender) => {
        const trimmedMessage = message.length > 150 ? message.substring(0, 100) + "..." : message;
        setAReplyMessage({ messageId, messageText: trimmedMessage, sender: sender });
        setReplyMessage(messageId); // Set the reply message
    }
    const cancelReply = () => {
        setReplyMessage(null); // Clear reply
        setAReplyMessage(null)
    };


    // Typing Events (Socket, IsTyping)
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
                const fixedMessages = response.data.map(msg => {
                    const trimmedReply = msg.replyTo && msg.replyTo.message 
                        ? msg.replyTo.message.substring(0, 100) + (msg.replyTo.message.length > 150 ? "..." : "")
                        : null;
                    return {
                        ...msg,
                        replyTo: msg.replyTo ? { ...msg.replyTo, message: trimmedReply } : null,
                        status: msg.status,
                        fixedCreatedAt: msg.createdAt, // Store original createdAt as fixed
                    };
                });                
                setMessages(fixedMessages);
                setLoading(false);
            }
        };
        fetchMessages();
    }, [currentChat]);
    
    // SetLoading True When the Chat Changes
    useEffect(()=>{
        setLoading(true);
    }, [currentChat])

    // Set Online / Offline Status
    useEffect(() => {
        if (!socket.current || !currentChat) return;
    
        socket.current.emit("get-online-users");
        socket.current.on("online-users", (users) => {
            setOnlineUsers(users);
            users.includes(currentChat._id) ? setStatus(statusOnline) : setStatus(statusOffline);
        });
    
        return () => socket.current.off("online-users"); // Cleanup listener
    }, [currentChat]);
    // Set Polling function to get online users every 15 seconds
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
    const handleSendMsg = async (msg, replyTo = null) => { 
        if (!msg.trim()) return;
    
        const tempId = Date.now().toString(); // Temporary ID
    
        // ✅ 1. Instantly update UI with temp message
        const newMessage = { 
            fromSelf: true, 
            message: msg, 
            createdAt: new Date().toISOString(),
            replyTo: aReplyMessage ? { message: aReplyMessage.messageText, messageId: aReplyMessage.messageId || tempId } : null,
            messageId: tempId, // Assign temporary ID
            isTemporary: true,
            status: "not_sent" // Flag to track temp messages
        };
        setMessages((prev) => [...prev, newMessage]);
    
        try {
            // ✅ 2. Send to server and wait for DB response
            const { data } = await axios.post(sendMessageRoute, {
                from: currentUser._id,
                to: currentChat._id,
                message: msg,
                replyTo: aReplyMessage ? aReplyMessage.messageId : null,
                onlineUsers: onlineUsers,
            });
            
            // ✅ 3. Replace temp message with real messageId
            setMessages((prev) => 
                prev.map(m => m.messageId === tempId 
                    ? { ...m, messageId: data._id, isTemporary: false, status: data.status,} // Update message with DB ID
                    : m
                )
            );
            
            
            // ✅ 4. Emit to socket with real messageId
            socket.current.emit("send-msg", {
                from: currentUser._id,
                to: currentChat._id,
                message: msg,
                replyTo: aReplyMessage 
                ? { 
                    message: aReplyMessage.messageText, 
                    sender: aReplyMessage.sender
                } 
                        : null, // ✅ Ensure replyTo includes the sender
                        messageId: data._id, // Use real ID from DB
                        onlineUsers: onlineUsers.includes(currentChat._id),
                        status: data.status,
                    });
                    
                    const container = chatContainerRef.current;
                    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            };    
            
    
    // Listen for incoming messages
    useEffect(() => {
        if (socket.current && currentChat) {
            const handleMessageReceive = (msg) => {
                if (msg.from === currentChat._id) {
                    setArrivalMessage({ 
                         fromSelf: false,
                         message: msg.message,
                         replyTo: msg.replyTo 
                         ? { message: msg.replyTo.message, sender: msg.replyTo.sender } 
                         : null, // ✅ Ensure replyTo has sender
                         id: msg.messageId ? msg.messageId : null,
                         createdAt: msg.createdAt || new Date().toISOString(),
                         status: msg.status,
                        });
                }
            };
            

            socket.current.on("msg-receive", handleMessageReceive);
            return () => socket.current.off("msg-receive", handleMessageReceive);
        }
    }, [currentChat, socket.current]);


    useEffect(() => {
        if (socket.current && currentChat) {
            const handleMessageReceive = (msg) => {
                if (msg.status === "sent") {
    
                    // ✅ Now update UI (optional: re-fetch messages or update status manually)
                    setMessages((prevMessages) =>
                        prevMessages.map((m) =>
                            m.status === "not_sent" ? { ...m, status: "sent" } : m
                        )
                    );
                }
            };
    
            socket.current.on("msg-receive", handleMessageReceive);
            return () => socket.current.off("msg-receive", handleMessageReceive);
        }
    }, [currentChat, socket.current]);
    
    

   
    // Handle If is Emojy
    const isOnlyEmojis = (message) => {
        if (!message) return false; // Handle empty messages
        if (!isNaN(message.charAt(0))) return false; // If first character is a number, return false
    
        const emojiRegex = /^(\p{Emoji}|\s)+$/u;
        return emojiRegex.test(message);
    };
    
    useEffect(() => {
        if (!socket.current || !currentChat) return;
    
        // ✅ Function to mark messages as read
        const markRead = async () => {
            try {
                const { data } = await axios.post(markReadRoute, {
                    userId: currentUser._id,
                    chatId: currentChat._id
                });
    
                if (data.success) {
                    // ✅ Update messages to "read" in UI
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.status !== "read" ? { ...msg, status: "read" } : msg
                        )
                    );
                    // ✅ Listen for "messages-read" event from the backend
                    socket.current.emit("messages-reader", {
                        userId: currentUser._id, 
                        chatId: currentChat._id,
                        status: data.status,
                    });

                }
            } catch (error) {
                console.error("❌ Error marking messages as read:", error);
            }
        };
        
        markRead(); // Run on component mount
        return () => socket.current.off("messages-reader");
    
    }, [currentChat, arrivalMessage]);

    useEffect(() => {
        if (socket.current) {
            socket.current.on("messages-sender", (msg) => {
                if (msg.status !== "read" && msg.from !== currentUser._id) {
                    // ✅ Show desktop notification
                    if (Notification.permission === "granted") {
                        new Notification("New Message", {
                            body: "message",
                        });
                    }
                }
    
                setMessages((prevMessages) =>
                    prevMessages.map((m) => ({
                        ...m,
                        status: msg.status, // 🔥 Only update status
                    }))
                );
            });
    
            return () => socket.current.off("messages-sender");
        }
    }, []);
    
    
    

    const sendNotification = () =>{
        if (Notification.permission === "granted") {
            new Notification("New Message", {
                body: "You have a new message!",
            });
        }
        
    }


    // Add arrivalMessage to messages
    useEffect(() => {
        arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage]);

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
                <button onClick={sendNotification}>Send Notification</button>
                <ClearChat currentChat={currentChat} getClearMessageRoute={getClearMessageRoute} currentUser={currentUser} setMessages={setMessages}/>
                <Logout socket={socket} />
            </div>
            <div className="chat-messages" ref={chatContainerRef}>
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
                            <div 
                                key={message._id || index} 
                                ref={index === messages.length - 1 ? scrollRef : null}
                            >
                            {/* Show Date Header */}
                            {showDate && (
                            <div className="date-separator">
                                <p>{moment(message.createdAt).format("LL")}</p>
                            </div>
                            )}
                            {/* Chat Message */}
                            <div className={`message ${message.fromSelf ? "sended" : "received"}`}>
                                {message.fromSelf && (
                                        <button
                                            className="reply-button"
                                            onClick={() => handleReply(message.id, message.message, currentChat._id)}
                                            onMouseEnter={() => setShowToolTip(true)}
                                            onMouseLeave={() => setShowToolTip(false)}
                                        >
                                            <BiReply className="reply-icon" style={{ transform: "scaleX(-1)" }}/>
                                            {showToolTip && <span className="tooltip">Reply</span>}
                                        </button>
                                    )

                                }
                                <div className={`content ${isOnlyEmojis(message.message) ? "emoji-only" : ""}`}>
                            {/* ✅ If it's a reply, show the original message */}
                                    {message.replyTo && (
                                        <div className={`replied-message ${message.replyTo.sender === currentUser._id ? "You" : "Other"}`}>
                                            <small className="reply-sender">
                                                {message.replyTo.sender === currentUser._id ? "You" : currentChat.username}
                                            </small>
                                            <p className={`reply-text`}>
                                                {message.replyTo.message}
                                            </p>
                                        </div>
                                    )}
                                    <p>{message.message}</p>
                                    <div className="status">
                                        <span className="message-time">
                                            {moment(message.createdAt || new Date()).format("hh:mm A")}
                                        </span>
                                        <p>
                                            {message.fromSelf && (
                                                message.status === "sent" ? (
                                                <span className="sent" title="Sent">
                                                    <BiCheckDouble />
                                                </span>
                                                ) : message.status === "not_sent" ? (
                                                    <span className="not_sent" title="Not Sent">
                                                    <BiCheck />
                                                </span>
                                                ) : message.status === "read" ? (
                                                <span className="read" title="Read">
                                                    <BiCheckDouble />
                                                </span>
                                                ) : null
                                            )}
                                        </p>
                                        
                                    </div>
                                </div>
                                {!message.fromSelf && (
                                    <button
                                        className="reply-button"
                                        onClick={() => handleReply(message.id, message.message, currentChat._id)}
                                        onMouseEnter={() => setShowToolTip(true)}
                                        onMouseLeave={() => setShowToolTip(false)}
                                    >
                                        <BiReply className="reply-icon" />
                                        {showToolTip && <span className="tooltip">Reply</span>}
                                    </button>
                                )

                                }
                            </div>
                        </div>
                        );
                    });
                    })()
                )}
                </div>
            <ChatInput handleSendMsg={handleSendMsg}
                       socket={socket}
                       currentChat={currentChat}
                       currentUser={currentUser}
                       isTyping={isTyping}
                       replyMessage={replyMessage}
                       cancelReply={cancelReply}
                       aReplyMessage={aReplyMessage ? aReplyMessage.messageText : ""}/>
        </Container>
    );
}

const Container = styled.div`
    .reply-button {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 6px;
        border-radius: 50%;
        position: relative;
        transition: background 0.2s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .status{
        padding-right: 10px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .status p{
        padding-left: 5px;
    }
    .read{
        color: Aqua;
    }
    .sent{
        color: black;
    }
    .not_sent{
        color: black;
    }
    .reply-button:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .reply-icon {
        border-radius: 50%;
        background: white;
        font-size: 20px;
        color: black;
        transition: color 0.2s ease-in-out;
    }

    .reply-button:hover .reply-icon {
        color: black;
    }

    .tooltip {
        position: absolute;
        bottom: 120%;
        left: 50%;
        transform: translateX(-50%);
        background: black;
        color: white;
        font-size: 12px;
        padding: 4px 6px;
        border-radius: 4px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-in-out;
    }

    .reply-button:hover .tooltip {
        opacity: 1;
        visibility: visible;
    }

    .message-time{
        font-size: 12px;
        font-family: "Josefin Sans", serif;
    }
    .replied-message {
        display: flex;
        flex-direction: column;
        max-width: 100%;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 5px;
        position: relative;
        background-color: rgba(255, 255, 255, 0.1); /* Light overlay */
        border-left: 4px solid #007bff; /* Default left border */
    }
    
    /* Sent messages (You) */
    .replied-message.Other {
        justify-content: flex-end;
        background-color: rgba(255, 0, 0, 0.3); /* Light overlay */
        border-left-color: #ffffff; /* White left border */
    }
    
    /* Received messages (Other) */
    .replied-message.You {
        align-self: flex-end;
        background-color: rgba(0, 0, 0, 0.4);
        border-left-color: black; /* Blue left border */
    }
    
    /* Sender name */
    .reply-sender {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 2px;
        color: #ffffffb3;
    }
    
    /* Reply message text */
    .reply-text {
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        word-wrap: break-word;
        color: white;
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