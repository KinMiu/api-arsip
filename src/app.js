require("dotenv").config();
const express = require("express");
const path = require("path");
const router = require("./routes");
const mongo = require("./database/mongo");
const logger = require("./utils/logger");
const cookies = require("cookie-parser");
const cors = require("cors");
// const {cors} = require("./config/index");
const {requestResponse} = require("./utils/index");

mongo
  .createConnection()
  .then((_) => {
    logger.info(`SUCCESS CONNECTING TO DATABASE MONGODB`);
  })
  .catch((err) => {
    console.error(err);
  });

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Type", "Content-Disposition"],
  })
);

// ⬇️ INI PENTING UNTUK PREFLIGHT
app.options("*", cors());
app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.use(router);

app.get("/", (req, res) => {
  res.json({
    msg: "selamat datang di Arsip Surat API",
  });
});

module.exports = app;
