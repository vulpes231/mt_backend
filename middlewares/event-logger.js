const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { v4: uuid } = require("uuid");
const { format } = require("date-fns");
const allowedOrigins = require("../configs/allowed-origins");
require("dotenv").config();
const jwt = require("jsonwebtoken");

async function eventLogger(message, logName) {
  const newDate = format(new Date(), "yyyy/MM/dd\tHH:mm:ss");
  const logItem = `${newDate}\t${uuid()}\t${message}`;
  console.log(logItem);

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
      await fsPromises.appendFile(
        path.join(__dirname, "..", "logs", logName),
        logItem
      );
    }
  } catch (err) {
    console.log(err);
  }
}

function logger(req, res, next) {
  eventLogger(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqlog.txt");
  console.log(`${req.method}\t${req.path}`);
  next();
}

function errorLogger(err, req, res, next) {
  eventLogger(`${err.name}\t${err.stack}`, "errorLog.txt");
  console.error(err.stack);
  res.status(500).send(err.message);
}

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", origin);
  }
  next();
};

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) res.status(401).json({ message: "You're not logged in!" });
  // console.log(authHeader);

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Session expired. please login again" });
    } else {
      req.user = decoded.username;
      next();
    }
  });
};
module.exports = { eventLogger, logger, errorLogger, verifyJwt, credentials };
