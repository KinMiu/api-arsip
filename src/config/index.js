require("dotenv").config();

const mongoURL =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_PROD
    : process.env.MONGO_DEV;

const mongoOptions = {
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
};

const allowedOrigins = [
  "http://localhost:5173",
  // "https://arsip.garnusa.com"
];

const cors = (req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  // ⬇️ PENTING untuk axios + blob
  res.header(
    "Access-Control-Expose-Headers",
    "Content-Type, Content-Disposition, X-Preview-Status"
  );

  // ⬇️ PRE-FLIGHT
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

module.exports = {
  mongoURL,
  mongoOptions,
  cors,
};
