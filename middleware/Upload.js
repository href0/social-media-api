const multer = require("multer");
const sharp = require("sharp");
const { promisify } = require("util");

const uploadPost = async (req, res, next) => {
  try {
    const fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "./assets/images/posts/");
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
        return cb(new Error("Only png jpg jpeg"));
        // return res.status(400).json({ error: "error" });
      }
    };

    let upl = await multer({
      storage: fileStorage,
      fileFilter: fileFilter,
    }).single("image");

    upl(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(406).json({
          error: true,
          message: err.message,
        });
      } else if (err) {
        return res.status(406).json({
          error: true,
          message: err.message,
        });
      }

      req.title = req.body.title;
      // req.fileCompress = filePath;
      next();
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "./assets/images/users/");
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
        return cb(new Error("Only png jpg jpeg"));
        // return res.status(400).json({ error: "error" });
      }
    };

    let upl = await multer({
      storage: fileStorage,
      fileFilter: fileFilter,
    }).single("profile_picture");

    upl(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log(err);
        return res.status(406).json({
          error: true,
          message: err.message,
        });
      } else if (err) {
        console.log(err);
        return res.status(406).json({
          error: true,
          message: err.message,
        });
      }
      req.title = req.body.title;
      next();
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = { uploadPost, uploadAvatar };
