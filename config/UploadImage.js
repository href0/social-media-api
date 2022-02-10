const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/images/posts");
  },
  filename: (res, file, cb) => {
    const originalName = file.originalname;
    const fileName = originalName.replace(/\s/g, "_");
    cb(null, new Date().getTime() + "-" + fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Onlu png jpg jpeg"));
  }
};

module.exports = { fileFilter, fileStorage };
