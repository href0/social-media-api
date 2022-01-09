import Users from "../models/UserModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "phone_number", "email"],
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error("getUserError: " + error);
  }
};

export const getUser = async (req, res) => {
  const phone = req.phone;
  try {
    const user = await Users.findOne({
      where: {
        phone_number: req.phone,
      },
    });
    res.status(200).json({ user });
  } catch (error) {
    console.error("getUserError: " + error);
  }
};
