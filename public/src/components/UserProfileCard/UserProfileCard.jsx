import React from "react";
import "./UserProfileCard.css";

const UserProfileCard = ({ profilePic, name, username, description }) => {
    return (
        <div className="user-profile-card">
            <div className="profile-picture">
                <img src={profilePic} alt="Profile" />
            </div>
            <div className="user-info">
                <h2>{name}</h2>
                <p className="username">@{username}</p>
                <p className="description">{description}</p>
            </div>
        </div>
    );
};

export default UserProfileCard;
