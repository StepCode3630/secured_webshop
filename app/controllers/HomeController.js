import path from "path";

export const index = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "home.html"));
};
