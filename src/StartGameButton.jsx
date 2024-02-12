import React, { useState } from 'react';
import socket from './utils/socket';
import './StartGameButton.css';

const StartGameButton = () => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartGame = () => {
    setIsStarting(true); // Disable button to prevent multiple clicks
    socket.emit('startGame');
    
    // Optionally reset isStarting when you receive confirmation the game has started
    socket.on('gameStarted', () => {
      setIsStarting(false); // Re-enable button or navigate away
    });
  };

  return (
    <button onClick={handleStartGame} disabled={isStarting}>
      {isStarting ? 'Starting...' : 'Start Game'}
    </button>
  );
};

export default StartGameButton;
