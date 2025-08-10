import { UserModel } from "../../DB/models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { generateDecryption, generateEncryption } from "../../utils/security/encryption.security.js";


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
  const hashedPassword = await generateHash({plaintext:password});
  const encryptedPhone = await generateEncryption({plaintext:phone});
  const user = await UserModel.create({
    fullName,
    email,
    password: hashedPassword,
    gender,
    phone:encryptedPhone,
    DOB,
  });

  successResponse({
    res,
    message: "User created successfully",
    data: user,
    status: 201,
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
  const isPasswordValid = await compareHash({plaintext:password,hashValue:user.password});
  if (!isPasswordValid) {
    throw new Error("Invalid credentials", { cause: 401 });
  } 
  user.phone = await generateDecryption({cipherText:user.phone});
  successResponse({
    res,
    message: "User logged in successfully",
    data: user,
    status: 200,
  });
});
