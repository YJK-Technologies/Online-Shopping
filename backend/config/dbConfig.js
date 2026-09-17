// // config/dbConfig.js
// module.exports = {

//   /*user: "sample",
//   password: "12345678",
//   server: "localhost",
//   database: "sample",
//   port: 1433,*/
//   user: "saraswathi",
//   password: "@%dSCt15",
//   server: "95.216.47.253",
//   database: "YJK_Kannakuputhagam",
//   port: 1433,
//   options: {
//     encrypt: false,
//   },   
//   // user: "sample",
//   // password: "123456789",
//   // server: "192.168.29.229",
//   // database: "YJKERP",
//   // port: 1433,
//   // options: {
//   //   encrypt: false,
//   // },   
// };

const path = require("path");
const dotenv = require("dotenv");

// Load backend/.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

module.exports = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
  },
  requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT) || 300000,
  connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT) || 300000,
};