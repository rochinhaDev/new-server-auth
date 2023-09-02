import jwt from "jsonwebtoken";

export default function generateToken(user) {
  // user._id, user.email, user.role user.name
  // assinatura do token
  const signature = process.env.TOKEN_SIGN_SECRET;
  // expiration time
  const expiration = "12h";
  return jwt.sign(
    { _id: user._id, email: user.email, role: user.role, name: user.name },
    signature,
    { expiresIn: expiration }
  );
}
