const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
const path = require("path");
const cors = require("cors");
const { corsOptions } = require("./configs/cors-options");
const cookieParser = require("cookie-parser");
const {
  logger,
  errorLogger,
  verifyJwt,
  credentials,
} = require("./middlewares/event-logger");

app.use(logger);

app.use(credentials);
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "/public")));

app.use("/enroll", require("./routers/enroll"));
app.use("/register", require("./routers/register"));
app.use("/auth", require("./routers/auth"));
app.use("/refresh", require("./routers/refresh"));
app.use("/logout", require("./routers/logout"));
app.use("/", require("./routers/root"));

app.use(verifyJwt);
app.use("/users", require("./routers/users"));
app.use("/account", require("./routers/account"));
app.use("/transactions", require("./routers/transactions"));
app.use("/change-password", require("./routers/change-password"));

app.use(errorLogger);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
