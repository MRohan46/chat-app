import React from "react";
import "./ProductCard.css"; // Import CSS file

const ProductCard = ({ title, image, onClick, description, showButton }) => {
  return (
    <div className="product">
      <img src={image} alt={title}/>
      <h3>{title}</h3>
      <p className="price">{description}</p>
      {showButton && <button onClick={onClick}>Try Now!</button>}
  </div>
  );
};

export default ProductCard;