import EmojiPicker from "emoji-picker-react";
import React, {useState, useRef, useEffect} from "react";
import styled from "styled-components";
import {IoMdSend} from "react-icons/io";



export default function ChatInput({handleSendMsg, socket, currentChat, currentUser, isTyping, replyMessage, cancelReply, aReplyMessage}){
    const [msg, setMsg] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(()=>{
        cancelReply();
    }, [currentChat])
    const faceEmojis = [
        "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😇", "😉", "😊", "🙂", "🙃", "😋", "😎", "😍", "😘",
        "😗", "😙", "😚", "🤩", "🥳", "😏", "😶", "😐", "😑", "😬", "🙄", "😮", "🤔", "🤨", "😤", "😠", "😡",
        "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😭", "😢", "😥", "😓", "🤗", "🤔", "😶‍🌫️", "🫥", "😵", "🤪", "🫣"
    ];

    const [randomEmoji, setRandomEmoji] = useState("");
    // Function to get a random face emoji
    const getRandomEmoji = () => {
        return faceEmojis[Math.floor(Math.random() * faceEmojis.length)];
    };
    // Change emoji whenever chat changes or component reloads
    useEffect(() => {
        setRandomEmoji(getRandomEmoji());
    }, [currentChat]);

    const typingTimeoutRef = useRef(null);

    const handleTyping = (e) => {
        const key = e.key;
    
        // Ignore modifier and non-text keys
        if (["Control", "Shift", "Alt", "Esc", "F5", "F12", "Tab"].includes(key)) {
            return;
        }
    
        // Emit "typing" event to the socket
        socket.current.emit("typing", { senderId: currentUser._id, receiverId: currentChat._id });
    
        // Clear previous timeout for stopping typing event
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.current.emit("stop-typing", { senderId: currentUser._id, receiverId: currentChat._id });
        }, 2000);
    };
    
    // For handling changes in the input field (typing text)
    const handleInputChange = (e) => {
        setMsg(e.target.value); // Update message state
        handleTyping(e); // Call the handleTyping function
    };
    


    const handleEmojiPickerHideShow = () => {
        setShowEmojiPicker((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);
    const handleOnEmojiClick = (emojiObject) => {
        setMsg((prevMsg) => prevMsg + emojiObject.emoji);
    };
    
    const sendChat = (event) => {
        event.preventDefault();
        if(msg.length > 0){
            handleSendMsg(msg, replyMessage);
            cancelReply();
            setMsg('');
            socket.current.emit("stop-typing", { senderId: currentUser._id, receiverId: currentChat._id });
            clearTimeout(typingTimeoutRef);
        }
    };
    return (
        <Container>
        {/* Typing indicator */}
        {isTyping && <TypingIndicator>{currentChat.username} is typing...</TypingIndicator>}
        {aReplyMessage && (
            <div className="reply-container">
                <p>Replying to: {aReplyMessage}</p>
                <button onClick={cancelReply}>Cancel</button>
            </div>
        )}

        <div className="button-container">
            <div className="emoji" ref={pickerRef}>
                <p onClick={handleEmojiPickerHideShow}>{randomEmoji}</p>
                {
                    showEmojiPicker && 
                    <EmojiPicker
                    onEmojiClick={handleOnEmojiClick}
                    theme="dark"
                    className="emoji-picker-react"
                    style={{
                        borderRadius: "8px",
                        padding: "10px",
                        border: "none",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        
                        /* Scrollbar Styling */
                        overflowY: "auto",
                        scrollbarWidth: "thick", // Firefox
                        scrollbarColor: "#ff6666 transparent", // Firefox
                    }}
                    />
                }
            </div>
        </div>
        <form className="input-container" onSubmit={(e)=>sendChat(e)}>
        <input
                type="text"
                placeholder="Type a message..."
                value={msg}
                onKeyDown={handleTyping}
                onChange={handleInputChange}
            />
            <button className="submit">
                <IoMdSend />
            </button>
        </form>
    </Container>
    )
}

const Container = styled.div`
display: grid;
grid-template-columns: 5% 95%;
align-items: center;
background-color: #181818;
padding: 0 2rem;
padding-bottom: 0.3rem;
border-bottom-right-radius: 2rem;
position: relative;
.reply-container{
    position: absolute;
    top: -50px;
    color: #c7c5c5;
    background-color: #333;
    padding: 1rem;
    border-radius: 5rem;
    left: 12px;
    font-size: 14px;
    opacity: 1;
}
.button-container{
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;
    .emoji{
        position: relative;
        user-select: none;
        p{
            font-size: 2rem;
            cursor: pointer;
        }
        .emoji-picker-react {
            position: absolute;
            top: -450px;
            height: 5rem;
            width: 5rem;
            .emoji-scroll-wrapper::-webkit-scrollbar{
                background-color: red;
            }
        }
    }
}
.input-container{
    width: 100%;
    display: flex;
    border-radius: 2rem;
    align-items: center;
    gap: 2rem;
    background-color: #333;
    @media screen and (min-width: 720px) and (max-width: 1080px){
        padding: 0 1rem;
        gap: 1rem;
        
    }
    @media screen and (min-width: 334px) and (max-width: 720px) {
        gap: 0.5rem;
    }
    input{
        width: 90%;
        background-color: transparent;
        color: white;
        border: none;
        padding-left: 1rem;
        font-size: 1.2rem;
        &::selection {
            background-color: #ff6666;
        }
        &:focus{
            outline: none;
        }
    }
    button{
        padding: 0.3rem 2rem;
        user-select: none;
        border-radius: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #ff6666;
        border: none;
        cursor: pointer;
        @media screen and (min-width: 720px) and (max-width: 1080px){
            padding: 0.3rem 1rem;
            svg{
                font-size: 1rem;
            }   
        }
        @media screen and (min-width: 334px) and (max-width: 720px) {
            padding: 0.1rem .4rem;
            svg{
                font-size: .5rem;
            }
        }
        svg{
            color: white;
            font-size: 2rem;
            
        }
    }
}
`;

const TypingIndicator = styled.div`
  position: absolute;
  top: -50px;
  color: #c7c5c5;
  background-color: #333;
  padding: 1rem;
  border-radius: 5rem;
  left: 12px;
  font-size: 14px;
  opacity: 0;
  animation: fadeIn 1.5s ease-in-out forwards, bounce 0.6s ease-in-out 1.5s infinite;

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    20% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
  }

  @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    25% {
      transform: translateY(-5px);
    }
    50% {
      transform: translateY(0);
    }
    75% {
      transform: translateY(-3px);
    }
    100% {
      transform: translateY(0);
    }
  }
  &.hide {
    animation: fadeOut 1s ease-in-out forwards;
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;
