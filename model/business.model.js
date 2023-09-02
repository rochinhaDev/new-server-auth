import { Schema, model } from "mongoose";

const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
    },

    logo: {
      type: String,
      default: "https://cdn.wallpapersafari.com/92/63/wUq2AY.jpg",
    },

    role: { type: String, enum: ["ADMIN", "BUSINESS"], default: "BUSINESS" },

    telefone: { type: String, required: true, trim: true },

    passwordHash: { type: String, required: true },

    active: { type: Boolean, default: true },

    description: { type: String },

    offers: [{type: Schema.Types.ObjectId, ref: "Job"}], //referencia ao model de jobs
  },
  // o que mais eu posso colocar nas opcoes do schema?
  { timestamps: true }
);

export default model("Business", businessSchema);
