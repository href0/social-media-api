const Users = require("../models/UserModel.js");
const jwt = require("jsonwebtoken");

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401); // Unauthorized
    const user = await Users.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user) return res.sendStatus(403); // Forbidden
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403); // Forbidden

        const userId = user.id;
        const levelId = user.level_id;
        const username = user.username;
        const full_name = user.full_name;
        const email = user.email;
        const provider = user.provider;
        const phone_number = user.phone_number;
        const accessToken = jwt.sign(
          {
            userId,
            levelId,
            username,
            phone_number,
            email,
            full_name,
            provider,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.error("refreshToken Error:" + error);
  }
};

module.exports = { refreshToken };
