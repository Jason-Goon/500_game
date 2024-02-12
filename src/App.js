import React, { useState, useEffect } from 'react';
import './App.css';
import GameBoard from './GameBoard';
import StartGameButton from './StartGameButton';
import JoinGameComponent from './JoinGameComponent';
import PlayerInfoPanel from './PlayerInfoPanel'; // Import the PlayerInfoPanel
import socket from './utils/socket'; // Ensure this import path is correct

function App() {
  const [hasJoined, setHasJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
  const [players, setPlayers] = useState([]); // Hold player data
  const [discardPileCards, setDiscardPileCards] = useState([]); // Corrected: State for discard pile cards
  const [playerTableCards, setPlayerTableCards] = useState([]); // Corrected: State for player table cards

  useEffect(() => {
    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('updatePlayers', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Corrected: Listen for card updates for the discard pile
    socket.on('updateDiscardPile', setDiscardPileCards);
  
    // Corrected: Listen for card updates for the player table
    socket.on('updatePlayerTable', setPlayerTableCards);

    return () => {
      socket.off('gameStarted');
      socket.off('updatePlayers');
      socket.off('updateDiscardPile');
      socket.off('updatePlayerTable');
    };
  }, []);

  const handleJoin = () => {
    setHasJoined(true);
    // Emit an event to join the game, handle this in your backend
    socket.emit('joinGame', { name: 'Player Name' }); // Ensure you're sending the correct player name or data
  };

  return (
    <div className="App">
      <h1>500</h1>
      {!hasJoined ? (
        <JoinGameComponent onJoin={handleJoin} />
      ) : (
        <>
          {gameStarted && <PlayerInfoPanel players={players} />}
          <GameBoard discardPileCards={discardPileCards} playerTableCards={playerTableCards} />
          {!gameStarted && <StartGameButton />}
        </>
      )}
    </div>
  );
}

export default App;
