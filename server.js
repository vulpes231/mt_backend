const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
const path = require("path");
const { logger, errorLogger } = require("./middlewares/event-logger");

app.use(logger);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));

app.use("/", require("./routers/root"));

app.use(errorLogger);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
