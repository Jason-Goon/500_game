const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;
const MAX_PLAYERS = 4; 
const MIN_PLAYERS_REQUIRED = 1;

let gameState = {
  players: [],
  deck: [],
  gameStarted: false,
  discardPile: [],
  playerTables: {},
};

// Function definitions (e.g., generateDeck, shuffle, dealCardsToPlayers, initializeGame) go here
function generateDeck(includeJokers = true) {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
  let deck = [];

  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ value, suit });
    });
  });

  if (includeJokers) {
    // Adding three Jokers with unique identifiers for differentiation
    deck.push({ value: 'Joker', suit: 'None', identifier: 'Joker1' });
    deck.push({ value: 'Joker', suit: 'None', identifier: 'Joker2' });
    deck.push({ value: 'Joker', suit: 'None', identifier: 'Joker3' });
  }

  // Shuffle the deck before returning
  return shuffle(deck);
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
  }
  return deck;
}
function dealCardsToPlayers() {
  const CARDS_PER_PLAYER = 7; // Adjust based on your game rules

  gameState.players.forEach(player => {
    player.hand = gameState.deck.splice(0, CARDS_PER_PLAYER); // Deal 7 cards to each player
    io.to(player.id).emit('updateHand', player.hand); // Notify each player of their new hand
  });

  // If needed, also handle the scenario where cards are placed on the table at the start
  // For example, flipping the first card of the remaining deck to start the discard pile
  if (gameState.deck.length > 0) {
    gameState.discardPile.push(gameState.deck.shift());
    io.emit('updateDiscardPile', gameState.discardPile); // Update all clients with the new discard pile state
  }
}

// Helper function to check if the cards form a valid three of a kind
function isThreeOfAKind(cards) {
  if (cards.length !== 3) return false;
  const firstCardValue = cards[0].value;
  return cards.every(card => card.value === firstCardValue);
}

// Helper function to check if the cards form a valid straight flush
function isStraightFlush(cards) {
  if (cards.length !== 4) return false;
  const suits = new Set(cards.map(card => card.suit));
  if (suits.size > 1) return false; // All cards must be of the same suit

  const values = cards.map(card => {
    if (card.value === 'Ace') return 14;
    if (card.value === 'King') return 13;
    if (card.value === 'Queen') return 12;
    if (card.value === 'Jack') return 11;
    return parseInt(card.value);
  }).sort((a, b) => a - b);

  for (let i = 0; i < values.length - 1; i++) {
    if (values[i + 1] - values[i] !== 1) return false;
  }

  return true;
}

// Assuming isValidPlay checks for either condition
function isValidPlay(cards) {
  return isThreeOfAKind(cards) || isStraightFlush(cards);
}

// Keep the generateDeck and shuffle functions here

function initializeGame() {
  gameState = {
    players: [],
    deck: generateDeck(), // This will now work as expected
    gameStarted: false,
    discardPile: [],
    playerTables: {},
  };
  console.log('Game initialized');
}

io.on('connection', (socket) => {
  console.log(`New player connected: ${socket.id}`);

  socket.on('joinGame', (playerName) => {
    // Prevent joining if the game has already started
    if (gameState.gameStarted) {
      socket.emit('joinError', 'Game has already started');
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      hand: [], // Assuming players have a 'hand' of cards or similar
      // Additional player properties as needed
    };

    gameState.players.push(player);
    console.log(`${playerName} joined the game`);

    // Optionally, send updated gameState to all players
    io.emit('updateGameState', gameState);

    // Confirm joining to the player
    socket.emit('joinSuccess', { playerName });
  });

  socket.on('startGame', () => {
    if (!gameState.gameStarted && gameState.players.length >= MIN_PLAYERS_REQUIRED) {
      gameState.gameStarted = true;
      gameState.deck = generateDeck();
      dealCardsToPlayers();
      io.emit('gameStarted', gameState);
      console.log('Game started');
    } else {
      console.log('Not enough players to start the game');
      socket.emit('startGameError', 'Not enough players');
    }
  });

  socket.on('drawCard', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && gameState.deck.length > 0 && gameState.gameStarted) {
      const drawnCard = gameState.deck.shift();
      player.hand.push(drawnCard);
      io.to(socket.id).emit('updateHand', player.hand);
    } else {
      socket.emit('actionError', 'Cannot draw card');
    }
  });

 
  socket.on('placeCardOnDiscardPile', (card) => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (!player || !gameState.gameStarted) {
      socket.emit('actionError', 'Cannot discard cards at this time.');
      return;
    }
  
    const index = player.hand.findIndex(c => c.value === card.value && c.suit === card.suit);
    if (index === -1) {
      socket.emit('actionError', 'Card not in hand');
      return;
    }
  
    // Discard the card and notify all clients
    gameState.discardPile.push(player.hand.splice(index, 1)[0]);
    io.emit('updateDiscardPile', gameState.discardPile); // Notify all clients about the updated discard pile
    io.to(socket.id).emit('updateHand', player.hand); // Update the player with their new hand
  });
  
  
  socket.on('makePlay', (cards) => {
    const player = gameState.players.find(p => p.id === socket.id);
    console.log(`Player ${socket.id} attempting to make a play with cards:`, cards);

    if (!player || !gameState.gameStarted) {
      console.log(`Play attempt failed: Game not started or player not found for socket ID ${socket.id}`);
      socket.emit('actionError', 'Cannot make a play at this time.');
      return;
    }
  
    if (!isValidPlay(cards)) {
      console.log(`Play attempt failed: Invalid play by player ${socket.id}`);
      socket.emit('playError', 'Invalid play');
      return;
    }
  
    const successfullyPlayedCards = [];
    cards.forEach(card => {
      const index = player.hand.findIndex(c => c.value === card.value && c.suit === card.suit);
      if (index !== -1) {
        successfullyPlayedCards.push(player.hand.splice(index, 1)[0]);
      }
    });

    console.log(`Successfully played cards for player ${socket.id}:`, successfullyPlayedCards);
  
    if (successfullyPlayedCards.length > 0) {
      gameState.playerTables[socket.id] = gameState.playerTables[socket.id] || [];
      gameState.playerTables[socket.id].push(...successfullyPlayedCards);
      console.log(`Updated play table for player ${socket.id}:`, gameState.playerTables[socket.id]);

      io.to(socket.id).emit('updateHand', player.hand); // Update the player with their new hand
      io.to(socket.id).emit('updatePlayerTable', gameState.playerTables[socket.id]); // Update the player with their play table
      io.emit('updateGameState', gameState); // Notify all clients with the updated game state
      console.log(`Game state updated after player ${socket.id}'s play`);
    } else {
      console.log(`Play attempt failed: No valid cards were played by player ${socket.id}`);
      socket.emit('playError', 'No valid cards were played');
    }
});

  
  

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    // Disconnect logic
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Any initial setup if needed
});