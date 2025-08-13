import Joi from "joi";
import { genderEnum } from "../../DB/models/User.model.js";

export const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(20).required(),
  email: Joi.string().email(),
  password: Joi.string().min(6).required(),
  gender: Joi.string()
    .valid(...Object.values(genderEnum))
    .required(),
  phone: Joi.string(),
  DOB: Joi.date(),
}).or("email", "phone");

export const loginSchema = Joi.object({
  email: Joi.string(),
  phone: Joi.string(),
  password: Joi.string().min(6).required(),
}).or("email", "phone");

export const googleLoginSchema = Joi.object({
  idToken: Joi.string().required(),
});
