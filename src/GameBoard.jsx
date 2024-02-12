import React, { useState, useEffect } from 'react';
import socket from './utils/socket'; // Update the path as per your project structure
import Hand from './Hand';
import DiscardPile from './DiscardPile';
import PlayerTable from './PlayerTable';

const GameBoard = () => {
  const [hand, setHand] = useState([]);
  const [discardPileCards, setDiscardPileCards] = useState([]);
  const [playerTableCards, setPlayerTableCards] = useState([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState([]);

  useEffect(() => {
    socket.on('dealCards', setHand);
    socket.on('updateHand', setHand);
    socket.on('updateDiscardPile', setDiscardPileCards);
    socket.on('updatePlayerTable', setPlayerTableCards);

    return () => {
      socket.off('dealCards');
      socket.off('updateHand');
      socket.off('updateDiscardPile');
      socket.off('updatePlayerTable');
    };
  }, []);

  const drawCardFromPack = () => {
    socket.emit('drawCard');
  };

  const handleSelectCard = (index) => {
    setSelectedCardIndices(prevIndices => {
      const isSelected = prevIndices.includes(index);
      return isSelected ? prevIndices.filter(i => i !== index) : [...prevIndices, index];
    });
  };

  const placeCardsOnPlayerTable = () => {
    const selectedCards = selectedCardIndices.map(index => hand[index]);
    if (isValidPlay(selectedCards)) {
      socket.emit('makePlay', selectedCards);
      setSelectedCardIndices([]);
    } else {
      alert("Selected cards do not form a valid play.");
    }
  };

  const placeCardOnDiscardPile = () => {
    if (selectedCardIndices.length === 1) {
      const selectedIndex = selectedCardIndices[0];
      const cardToDiscard = hand[selectedIndex];
      socket.emit('placeCardOnDiscardPile', cardToDiscard);
      setSelectedCardIndices([]);
    } else {
      alert("Please select exactly one card to discard.");
    }
  };

  // Helper function to validate if the selected cards make a valid play.
  // This should mirror the validation logic on the server side.
  function isValidPlay(selectedCards) {
    // Add your validation logic here based on the selectedCards.
    // For simplicity, let's assume any selection is valid.
    return true;
  }

  return (
    <div className="gameBoard">
      <DiscardPile cards={discardPileCards} />
      <PlayerTable cards={playerTableCards} />
      <button onClick={drawCardFromPack}>Draw Card from Pack</button>
      {selectedCardIndices.length > 0 && (
        <button onClick={placeCardsOnPlayerTable}>Place Selected Cards on Player Table</button>
      )}
      {selectedCardIndices.length === 1 && (
        <button onClick={placeCardOnDiscardPile}>Discard Selected Card</button>
      )}
      <Hand
        cards={hand}
        onSelectCard={handleSelectCard}
        selectedCardIndices={selectedCardIndices}
      />
    </div>
  );
};

export default GameBoard;
