import express from "express";
import UserModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../config/jwt.config.js";
import isAuth from "../middlewares/isAuth.js";
const userRouter = express.Router();
const SALT_ROUNDS = 10; // quanto maior o numero maior a demora para criar a hash
userRouter.post("/signup", async (req, res) => {
  try {
    const form = req.body;
    if (!form.email || !form.password) {
      throw new Error("Por favor, envie um email e uma senha.");
    }
    if (
      form.password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/gm
      ) === false
    ) {
      throw new Error("A senha não preenche os requisitos básicos.");
    }
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    console.log(salt);
    const hashedPassword = await bcrypt.hash(form.password, salt);
    const user = await UserModel.create({
      ...form,
      passwordHash: hashedPassword,
    });
    user.passwordHash = undefined;
    console.log(req.body);
    return res.status(201).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
});
userRouter.post("/login", async (req, res) => {
  try {
    const form = req.body;

    if (!form.email || !form.password) {
      throw new Error("Por favor, preencha todos os dados!");
    }

    // procuro o user pelo email dentro do banco de dados
    const user = await UserModel.findOne({ email: form.email });

    //compare() também retorna TRUE se for igual as senhas e retorna FALSE se a senha não foi igual!!
    if (await bcrypt.compare(form.password, user.passwordHash)) {
      //senhas iguais, pode fazer login

      //gerar um token
      const token = generateToken(user);
      user.passwordHash = undefined;

      return res.status(200).json({
        user: user,
        token: token,
      });
    } else {
      //senhas diferentes, não pode fazer login
      throw new Error(
        "Email ou senha não são válidos. Por favor tenta novamente."
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
});

userRouter.get("/profile", isAuth, async (req, res) => {
  try {
    console.log(req.auth);
    const id_user = req.auth._id;
    const user = await UserModel.findById(id_user)
      .select("-passwordHash")
      .populate("history");
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
userRouter.put("/edit", isAuth, async (req, res) => {
  try {
    const id_user = req.auth._id;
    const updateUser = await UserModel.findByIdAndUpdate(
      id_user,
      { ...req.body },
      { new: true, runValidators: true }
    );
    return res.status(200).json(updateUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export default userRouter;
