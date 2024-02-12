// src/components/Hand.jsx
import React from 'react';
import Card from './Card';
import './Hand.css'; // Ensure this CSS file contains styles for .multi-selected and .single-selected

const Hand = ({ cards, onSelectCard, selectedCardIndices }) => {
  return (
    <div className="hand">
      {cards.map((card, index) => (
        <div 
          key={index} 
          onClick={() => onSelectCard(index)}
          className={`card ${
            selectedCardIndices.includes(index)
              ? selectedCardIndices.length > 1
                ? 'multi-selected'
                : 'single-selected'
              : ''
          }`}
        >
          {/* Assuming Card is a component that takes card details and renders them */}
          <Card value={card.value} suit={card.suit} />
        </div>
      ))}
    </div>
  );
};

export default Hand;
