import jwt from "jsonwebtoken";
export const generateToken = ({ id }) => {
  const access_token = jwt.sign({ id }, "access_token", {
    expiresIn: "1h",
  });
  const refresh_token = jwt.sign({ id }, "refresh_token", {
    expiresIn: "1y",
  });
  return { access_token, refresh_token };
};

export const verifyToken = (token) => {
  if (!token) {
    throw new Error("Invalid token", { cause: 401 });
  }

  try {
    return jwt.verify(token, "access_token");
  } catch (error) {
    throw new Error("Invalid token", { cause: 401 });
  }
};
