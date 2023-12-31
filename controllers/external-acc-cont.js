const usersDB = {
  users: require("../models/users.json"),
  setUser: function (data) {
    this.users = data;
  },
};

const externalDB = {
  accounts: require("../models/external.json"),
  setAccount: (data) => {
    this.accounts = data;
  },
};

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const createExternalAccount = async (req, res) => {
  const { account_num, routing_num, nickname, account_type } = req.body;

  const username = req.user;

  console.log(req.body);

  if (!account_num || !routing_num || !account_type) return res.sendStatus(400);

  const user = usersDB.users.find((usr) => usr.username === username);

  if (!user) return res.status(404).json({ message: "User not found!" });

  try {
    const newExternalAccount = {
      id:
        externalDB.accounts.length > 0
          ? externalDB.accounts[externalDB.accounts.length - 1].id + 1
          : 1,
      account_num: account_num,
      routing_num: routing_num,
      account_type: account_type,
      creator: user.username,
      nickname: nickname || null,
    };

    externalDB.accounts.push(newExternalAccount);

    await fsPromises.writeFile(
      path.join(__dirname, "../models/external.json"),
      JSON.stringify(externalDB.accounts)
    );
    res.status(201).json({ message: "External account added!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

const getUserExternalAccounts = async (req, res) => {
  const { username } = req.params;
  if (!username) return res.sendStatus(400);

  try {
    const userExternalAccts = externalDB.accounts.find(
      (acct) => acct.creator === username
    );

    if (!userExternalAccts || userExternalAccts.length === 0)
      return res.status(200).json({ message: "You have no accounts" });
    res.status(200).json(userExternalAccts);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

module.exports = { createExternalAccount, getUserExternalAccounts };
