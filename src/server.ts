import express from "express";

const PORT = 3000;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello NB07~!~!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
