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
        const name = user.username;
        const phone_number = user.phone_number;
        const accessToken = jwt.sign(
          { userId, levelId, name, phone_number },
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
