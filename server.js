const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
const path = require("path");
const cors = require("cors");
const { corsOptions } = require("./configs/cors-options");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const {
  logger,
  errorLogger,
  verifyJwt,
  credentials,
} = require("./middlewares/event-logger");
const { connectDB } = require("./configs/connectDb");
const mongoose = require("mongoose");

// Connect to the database
connectDB();

// Middleware setup
app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));

// Public routes (don't require authentication)
app.use("/register", require("./routers/register"));
app.use("/auth", require("./routers/auth"));
app.use("/", require("./routers/root"));

// Authentication middleware
app.use(verifyJwt);

// Authenticated routes
app.use("/users", require("./routers/users"));
app.use("/account", require("./routers/account"));
app.use("/transactions", require("./routers/transactions"));
app.use("/change-password", require("./routers/change-password"));
app.use("/refresh", require("./routers/refresh"));
app.use("/logout", require("./routers/logout"));
app.use("/transfer", require("./routers/transfer"));

// Error handling middleware
app.use(errorLogger);

// Start the server once the database connection is open
mongoose.connection.once("open", () => {
  app.listen(PORT, () =>
    console.log(`Server started on port http://localhost:${PORT}`)
  );
});
