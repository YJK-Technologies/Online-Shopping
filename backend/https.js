const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const https = require("https");
const http = require("http"); // Import HTTP module
const dataRoutes = require("./routes/dataRoutes");
const app = express();


const HTTPS_PORT = 5567; // HTTPS server port

// SSL options for HTTPS
const sslOptions = {
  key: fs.readFileSync(path.resolve("C:/Utils/Certificates/STAR.yjktechnologies.com_cert_Nov2025", "STAR.yjktechnologies.com_key.key")),
  cert: fs.readFileSync(path.resolve("C:/Utils/Certificates/STAR.yjktechnologies.com_cert_Nov2025", "STAR.yjktechnologies.com.crt")),
  ca: fs.readFileSync(path.resolve("C:/Utils/Certificates/STAR.yjktechnologies.com_cert_Nov2025", "STAR.yjktechnologies.com.ca-bundle")),
};

app.use(cors( {limit:'50mb'} ));
app.use(express.json({limit:'50mb'}));

// Middleware
app.use("/", dataRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the home page!");
});

// Create HTTP server
// Create HTTPS server
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on https://localhost:${HTTPS_PORT}`);
  });




