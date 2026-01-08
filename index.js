require("dotenv").config();

const http = require("http");
const logger = require("./src/utils/logger");
const app = require("./src/app");
const {Server} = require("socket.io");
const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         methods: ['GET', 'POST']
//     }
// })

// io.on("connection", (socket) => {
//     console.log("✅ Karyawan terhubung ke socket:", socket.id)

//     socket.on("disconnect", () => {
//         console.log("❌ Karyawan terputus:", socket.id);
//     })
// })

// app.set("io", io)

server.listen(process.env.PORT, () => {
  logger.info(`SERVER RUNNING IN PORT ${process.env.PORT}`);
});
