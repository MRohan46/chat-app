import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import chat from '../assets/chat.png'


export default function Welcome({currentUser}){

    return <Container>
        <img src={chat} alt="Robot"/>
        {currentUser && <h1>Welcome, <span>{currentUser.username}</span></h1>}
        <h3>Please select a chat to begin your conversation!</h3>

    </Container>
}

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: white;
    img{
        height: 20rem;
        margin-bottom: 1.5rem;
    }
    span{
        color: tomato;
    }
    @media screen and (min-width: 120px) and (max-width: 1080px) {
        img{
            height: 10rem;
        }
    }
`;