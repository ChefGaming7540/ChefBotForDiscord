const { users, saveUsers } = require('./database');
const config = require('../config');

function getUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      ...config.STARTING_RESOURCES,
      inventory: [],
      lastDaily: null,
      lastMinigame: null,
      lastTrade: null,
      tradeHistory: []
    };
    saveUsers();
  }
  return users[userId];
}

function saveUser(userId) {
  saveUsers();
}

module.exports = {
  getUser,
  saveUser
};