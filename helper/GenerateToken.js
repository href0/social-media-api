const jwt = require("jsonwebtoken");
const Users = require("../models/UserModel.js");

const generateToken = async (
  userId,
  levelId,
  username,
  phone_number,
  email,
  full_name,
  provider
) => {
  const accessToken = jwt.sign(
    { userId, levelId, username, phone_number, email, full_name, provider },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // generate refreshToken
  const refreshToken = jwt.sign(
    { userId, levelId, username, phone_number, email, full_name, provider },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "90d" }
  );

  // update refreshToken
  await Users.update(
    { refresh_token: refreshToken },
    {
      where: { id: userId },
    }
  );

  return { accessToken, refreshToken };
};

module.exports = { generateToken };
