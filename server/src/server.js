const express = require("express");
const cors = require("cors");
const path = require("path");
const solveRoutes = require("./routes/solveRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const clientPath = path.resolve(__dirname, "../../client");
app.use(express.static(clientPath));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

app.use("/", solveRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).json({
    error: "Unexpected server error.",
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
