// src/components/DiscardPile.jsx
import React from 'react';
import Card from './Card';
import './DiscardPile.css'; // Ensure this is correctly pointing to your CSS file

const DiscardPile = ({ cards }) => {
    return (
        <div className="discardPile">
            <h3>Discard Pile</h3>
            <div className="cards"> {/* This container will hold the cards in a row */}
                {cards.map((card, index) => (
                    <Card key={index} value={card.value} suit={card.suit} />
                ))}
            </div>
        </div>
    );
};

export default DiscardPile;
