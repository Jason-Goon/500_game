// src/components/PlayTable.jsx
import React from 'react';
import Card from './Card';
import './PlayerTable.css'; // Create corresponding CSS for layout

const PlayTable = ({ cards }) => {
    return (
        <div className="playerTable">
            <h3>Your Plays</h3>
            <div className="play-cards">
                {cards.map((card, index) => (
                    <Card key={index} value={card.value} suit={card.suit} />
                ))}
            </div>
        </div>
    );
};

export default PlayTable;
