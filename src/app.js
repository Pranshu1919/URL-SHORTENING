const express = require("express");
const urlRoutes = require("./routes/urlRoutes");
const slidingWindowRateLimiter = require("./middlewares/rateLimiter");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"],
}));


app.set("trust proxy", 1);

app.use(slidingWindowRateLimiter);

app.use(express.json());
app.use("/", urlRoutes);

module.exports = app;

