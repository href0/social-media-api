const axios = require("axios");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; // mengambil header
  const token = authHeader && authHeader.split(" ")[1]; // mengambil token, jika tidak ada header makan null
  if (token == null)
    return res.status(401).json({ error: true, message: "Token tidak valid" }); // jika token null status Unauthorized

  if (req.body.provider == "google") {
    try {
      const verify = await axios.get(
        "https://oauth2.googleapis.com/tokeninfo?id_token=" + token
      );
      if (verify) {
        // check email yang dikirim dari client apakah sama dengan email dari token
        if (
          verify.data.email == req.body.email &&
          verify.data.sub == req.body.uid
        ) {
          req.email = verify.data.email;
          req.uid = verify.data.sub;
          req.name = verify.data.name;
          req.provider = req.body.provider;
          next();
        } else {
          return res
            .status(400)
            .json({ error: true, message: "Uid tidak valid" });
        }
      }
    } catch (error) {
      return res
        .status(400)
        .json({ error: true, message: "Token tidak valid" });
    }
  } else if (req.body.provider == "facebook") {
    try {
      const verify = await axios.get(
        "https://graph.facebook.com/me?access_token=" + token
      );
      if (verify) {
        // check apakah uid yang dikirim dari client sama dengan uid dari token
        if (verify.data.id == req.body.uid) {
          req.email = req.body.email;
          req.uid = req.body.uid;
          req.name = verify.data.name;
          req.provider = req.body.provider;
          next();
        } else {
          return res
            .status(400)
            .json({ error: true, message: "Uid Tidak valid" });
        }
      }
    } catch (error) {
      return res
        .status(400)
        .json({ error: true, message: "Token tidak valid" });
    }
  }
};

module.exports = { verifyToken };
