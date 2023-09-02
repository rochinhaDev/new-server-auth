import express from "express";
import uploadImg from "../config/cloudinary.config.js";
const uploadRouter = express.Router();
uploadRouter.post("/file", uploadImg.single("picture"), (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      throw new Error("Por favor, envie uma imagem");
    }
    return res.status(201).json({ url: req.file.path });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Algo deu errado");
  }
});
export default uploadRouter;
