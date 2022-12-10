const users = [];
const answerList = [];

const addUser = ({ id, name, room }) => {
  const user = { id, name, room };
  users.push(user);
  return { user };
};

const addUserChoice = ({ id, name, room, choice }) => {
  const choices = { id, name, room, choice };
  users.push(choices);
  return { choices };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  addUserChoice,
};
