import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import loader from '../assets/loader.gif';
import { ToastContainer, toast} from 'react-toastify';
import axios from 'axios';
import { setAvatarRoute } from '../utils/APIRoutes';
import { Buffer } from 'buffer';

export default function SetAvatar() {
    const api = "https://api.dicebear.com/9.x/bottts/svg";
    const navigate = useNavigate();
    const [avatars, setAvatars] = useState([]);
    const [isLoading, setIsLoading] = useState([true]);
    const [selectedAvatar, setSelectedAvatar] = useState([undefined]);

    const ToastOptions = {
        position: "top-right",
        autoClose: 8000,
        pauseOnHover: true,
        theme: "dark",
    };

    useEffect(()=> {
        if(!localStorage.getItem("chat-app-user")){
            navigate("/");
        }
    }, [])
    const setProfilePicture = async () => {
        if (selectedAvatar === undefined) {
            toast.error("Please select an avatar first.");
        } else {
            try {
                const user = JSON.parse(localStorage.getItem("chat-app-user"));
                const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
                    image: avatars[selectedAvatar],
                });
    
                if (data.isSet) {
                    // Update the user object in localStorage
                    user.isAvatarImageSet = true;
                    user.avatarImage = data.image;
                    localStorage.setItem("chat-app-user", JSON.stringify(user));
    
                    // Navigate to the home page
                    navigate('/');
                } else {
                    toast.error('An Error Occurred, Please Try Again!', ToastOptions);
                }
            } catch (error) {
                console.error("Error setting profile picture:", error);
                toast.error('An Error Occurred, Please Try Again!', ToastOptions);
            }
        }
    };
    const fetchAvatars = async () => {
        const data = [];
        for (let i = 0; i < 4; i++) {
            const image = await axios.get(`${api}?seed=${Math.round(Math.random() * 1000)}`);
            const buffer = new Buffer(image.data);
            data.push(buffer.toString("base64"));
        }
        setAvatars(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAvatars();
    }, []);

    const handleRefresh = () => {
      setIsLoading(true);
      fetchAvatars();
    };

    return (
        <>
        {
            isLoading ? <Container>
                <img src={loader} alt="loader" className='loader' />
            </Container> : 
            (
                <Container>
                    <div className="title-container">
                        <h1>To complete your profile, please pick an avatar as your picture.</h1>
                    </div>
                    <div className="avatars">{
                        avatars.map((avatar, index)=> {
                            return(

                                <div key={index} className={`avatar ${
                                    selectedAvatar === index ? "selected": ""
                                }`}
                                >
                                    <img src={`data:image/svg+xml;base64,${avatar}`} alt="avatar" onClick={()=>setSelectedAvatar(index)} />
                                </div>
                            );
                        }) 
                    }</div>
                    <div className="buttons">
                        <button onClick={handleRefresh}>Refresh Avatars</button>
                        <button className='submit-btn' onClick={setProfilePicture}>Select Profile Picture</button>
                    </div>
        
                </Container>
            )
        };
        <ToastContainer />
        </>
    );
}

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 3rem;
    background-color: #181818;
    height: 100vh;
    width: 100vw;
    .loader {
        max-inline-size: 100%;
    }
    .title-container {
        h1{
          color: white;  
        }
    }
    .avatars{
        display: flex;
        gap: 2rem;
        .avatar{
            border: 0.4rem solid transparent;
            padding: 0.4rem;
            border-radius: 5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: 0.5s ease-in-out;
            img {
                user-select: none;
                height: 6rem;
            }
        }
        .selected {
            border: 0.4rem solid #e91e63;
            
        }
    }
    .buttons{
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3rem;
        padding: 20px;
        button{
            margin-top: 20px;
            padding: 20px 30px;
            background-color: #ff6347; /* Example: tomato color */
            color: white;
            font-size: 28px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;

            &:hover {
                background-color: #e53e31; /* Darker tomato color on hover */
            }
        }
    }
`;

