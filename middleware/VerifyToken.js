import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // mengambil header
  const token = authHeader && authHeader.split(" ")[1]; // mengambil token, jika tidak ada header makan null
  if (token == null) return res.sendStatus(401); // jika token null status Unauthorized

  // jika token ada, maka verify tokennya
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.email = decoded.email;
    req.phone = decoded.phone_number;
    next();
  });
};
