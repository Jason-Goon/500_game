import React from 'react';
import './Card.css'; // This imports the CSS file for side effects.

const Card = ({ value, suit }) => {
  // Log to verify the component is rendering and inspect the props.
  

  return (
    <div className="card">
      {value} of {suit}
    </div>
  );
};

export default Card;
