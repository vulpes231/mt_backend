require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
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
  credentials,
} = require("./middlewares/event-logger");
const { connectDB } = require("./configs/connectDb");
const mongoose = require("mongoose");
const { verifyToken } = require("./middlewares/verifyToken");

connectDB();

app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));

app.use("/manage-admin", require("./routers/admin/adminRoute"));
app.use("/auth", require("./routers/auth"));
app.use("/", require("./routers/root"));

const requireAuth = verifyToken();
const requireAdmin = verifyToken("admin");

app.use(requireAuth);
app.use("/user", require("./routers/users"));
app.use("/account", require("./routers/account"));
app.use("/transactions", require("./routers/transactions"));
app.use("/change-password", require("./routers/change-password"));
app.use("/refresh", require("./routers/refresh"));
app.use("/logout", require("./routers/logout"));
app.use("/transfer", require("./routers/transfer"));
app.use("/external", require("./routers/external"));

app.use(
  "/manage-account",
  requireAdmin,
  require("./routers/admin/accountRoute"),
);
app.use(
  "/manage-transaction",
  requireAdmin,
  require("./routers/admin/transaction"),
);
app.use(
  "/manage-user",
  requireAdmin,
  require("./routers/admin/manageUserRoute"),
);

app.use(errorLogger);

mongoose.connection.once("open", () => {
  app.listen(PORT, () =>
    console.log(`Server started on port http://localhost:${PORT}`),
  );
});
