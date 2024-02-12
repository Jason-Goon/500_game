// src/components/JoinGameComponent.js
import React, { useState } from 'react';
import socket from './utils/socket'; // Make sure the path matches your project structure

const JoinGameComponent = ({ onJoin }) => {
  const [playerName, setPlayerName] = useState('');

  const joinGame = () => {
    if (playerName.trim()) {
      socket.emit('joinGame', playerName);
      console.log(`${playerName} is attempting to join the game`);
      onJoin(true); // This is a callback to inform the App component that the player has joined
    } else {
      alert('Please enter your name.');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>
    </div>
  );
};

export default JoinGameComponent;
