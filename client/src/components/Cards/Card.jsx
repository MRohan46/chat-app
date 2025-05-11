import React from "react";
import "./Card.css"; // Import CSS file

const Card = ({ title, description, image, link }) => {
  return (
    <div className="card">
      <img src={image} alt="Card" className="card-image" />
      <div className="card-content">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;
