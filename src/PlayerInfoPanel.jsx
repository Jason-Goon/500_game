// src/PlayerInfoPanel.jsx
import React from 'react';
import './PlayerInfoPanel.css'; // Importing the CSS for styling

const PlayerInfoPanel = ({ players }) => {
  return (
    <div className="playerInfoPanel">
      <h2>Players</h2>
      {players.map((player, index) => (
        <div key={index} className="player">
          <h3>{player.name}</h3>
          <p>Cards: {player.hand.length}</p>
          <div className="playerGames">
            <h4>Plays</h4>
            {player.playTable.map((game, gameIndex) => (
              <div key={gameIndex} className="game">
                {/* Display each game/cards made by the player */}
                {game.map((card, cardIndex) => (
                  <span key={cardIndex}>{`${card.value} of ${card.suit}`}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerInfoPanel;
