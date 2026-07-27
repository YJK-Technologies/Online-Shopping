// app.js
const express = require("express");
const cors = require("cors");
const dataRoutes = require("./routes/dataRoutes");
const app = express();
const PORT = 5567;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/heartbeat", (req, res) => {
  res.send("I am alive");
});

app.use("/", dataRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});