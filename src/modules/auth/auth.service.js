import { UserModel } from "../../DB/models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import {
  generateDecryption,
  generateEncryption,
} from "../../utils/security/encryption.security.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../../utils/email/index.js";
import { generateOtp } from "../../utils/security/otp.security.js";

export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password, gender, phone, DOB } = req.body;
  const userExists = await UserModel.findOne({
    $or: [
      {
        $and: [
          { email: { $exists: true } },
          { email: { $ne: null } },
          { email: email },
        ],
      },
      {
        $and: [
          { phone: { $exists: true } },
          { phone: { $ne: null } },
          { phone: phone },
        ],
      },
    ],
  });

  if (userExists) {
    throw new Error("User already exists", { cause: 409 });
  }
  const hashedPassword = await generateHash({ plaintext: password });
  const encryptedPhone = await generateEncryption({
    plaintext: phone,
  });
  const { otp, otpExpireDate } = generateOtp();
  const user = new UserModel({
    fullName,
    email,
    password: hashedPassword,
    gender,
    phone: encryptedPhone,
    DOB,
    otp,
    otpExpireDate,
  });
  await sendMail({
    to: email,
    subject: "Confirm your email",
    html: `<p>your otp to verify your email is : <span style="font-size:20px ;font-weight: bold;">${otp}</span></p>`,
  });

  await user.save();

  successResponse({
    res,
    message: "User created successfully",
    data: user,
    status: 201,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;
  const user = await UserModel.findOne({
    otp,
    email,
    otpExpireDate: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    throw new Error("Invalid OTP", { cause: 401 });
  }
  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpireDate = undefined;
  await user.save();
  successResponse({
    res,
    message: "Email verified successfully",
    status: 200,
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { otp, otpExpireDate } = generateOtp();
  await UserModel.updateOne({ email }, { otp, otpExpireDate });
  await sendMail({
    to: email,
    subject: "Confirm your email",
    html: `<p>your new otp to verify your email is : <span style="font-size:20px ;font-weight: bold;">${otp}</span></p>`,
  });
  successResponse({
    res,
    message: "Otp resent successfully",
    status: 200,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  const user = await UserModel.findOne({
    $or: [
      {
        $and: [
          { email: { $exists: true } },
          { email: { $ne: null } },
          { email: email },
        ],
      },
      {
        $and: [
          { phone: { $exists: true } },
          { phone: { $ne: null } },
          { phone: phone },
        ],
      },
    ],
  });
  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }
  const isPasswordValid = await compareHash({
    plaintext: password,
    hashValue: user.password,
  });
  if (!isPasswordValid) {
    throw new Error("Invalid credentials", { cause: 401 });
  }
  const access_token = jwt.sign({ id: user._id }, "access_token", {
    expiresIn: "1h",
  });
  const refresh_token = jwt.sign({ id: user._id }, "refresh_token", {
    expiresIn: "1y",
  });
  successResponse({
    res,
    message: "User logged in successfully",
    data: { access_token, refresh_token },
    status: 200,
  });
});
