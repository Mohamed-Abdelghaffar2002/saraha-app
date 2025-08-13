import {
  genderEnum,
  userAgentEnum,
  UserModel,
} from "../../DB/models/User.model.js";
import { successResponse } from "../../utils/response/index.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { generateEncryption } from "../../utils/security/encryption.security.js";
import { sendMail } from "../../utils/email/index.js";
import { generateOtp } from "../../utils/security/otp.security.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken, verifyToken } from "../../utils/token/index.js";

export const signup = async (req, res, next) => {
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
  if (email) {
    await sendMail({
      to: email,
      subject: "Confirm your email",
      html: `<p>your otp to verify your email is : <span style="font-size:20px ;font-weight: bold;">${otp}</span></p>`,
    });
  }

  await user.save();

  const { access_token, refresh_token } = generateToken({ id: user._id });
  successResponse({
    res,
    message: "User created successfully",
    data: { access_token, refresh_token },
    status: 201,
  });
};

export const verifyEmail = async (req, res, next) => {
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
};

export const resendOtp = async (req, res, next) => {
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
};

export const login = async (req, res, next) => {
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
  const { access_token, refresh_token } = generateToken({ id: user._id });
  successResponse({
    res,
    message: "User logged in successfully",
    data: { access_token, refresh_token },
    status: 200,
  });
};

export const googleLogin = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client(
    "201733628348-0q094odpm8um82338gqkhgk4hg2ss4no.apps.googleusercontent.com"
  );
  const ticket = await client.verifyIdToken({
    idToken,
  });
  const payload = ticket.getPayload();
  let user = await UserModel.findOne({
    email: payload.email,
  });
  if (!user) {
    user = await UserModel.create({
      email: payload.email,
      fullName: payload.name,
      phone: payload.phone,
      DOB: payload.birthdate,
      gender: payload.gender,
      isEmailVerified: true,
      userAgent: userAgentEnum.google,
    });
  }
  const { access_token, refresh_token } = generateToken({ id: user._id });

  successResponse({
    res,
    message: "User logged in successfully",
    data: { access_token, refresh_token },
    status: 201,
  });
};

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const data = verifyToken(authorization);
  console.log(data);
  const { access_token, refresh_token } = generateToken({ id:data.id});
  successResponse({
    res,
    message: "User is verified successfully",
    data: { access_token, refresh_token },
    status: 200,
  });
};

export const updatePassword = async (req, res, next) => {
  const { authorization } = req.headers;
  const { oldPassword, newPassword } = req.body;
  if (!authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const data = verifyToken(authorization);
  const user = await UserModel.findById(data.id);
  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }
  const isPasswordValid = await compareHash({
    plaintext: oldPassword,
    hashValue: user.password,
  });
  if (!isPasswordValid) {
    throw new Error("Invalid credentials", { cause: 401 });
  }
  user.password = await generateHash({ plaintext: newPassword });
  await user.save();
  console.log(data);
  successResponse({
    res,
    message: "Password updated successfully",
    status: 200,
  });
};
