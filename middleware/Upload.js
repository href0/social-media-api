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

const upload = async (req, res, next) => {
  try {
    let upl = await multer({
      storage: fileStorage,
      fileFilter: fileFilter,
    }).single("image");

    upl(req, res, function (err) {
      const file = req.file.path;
      if (!file) {
        return res.status(400).json(req.file);
      }
      if (err instanceof multer.MulterError) {
        return res.status(406).json({
          status: "Error",
          message: "File yang diizinkan hanya JPG|JPEG|PNG",
        });
      } else if (err) {
        return res.status(406).json({
          status: "Error",
          message: "File yang diizinkan hanya JPG|JPEG|PNG",
        });
      }
      req.title = req.body.title;
      next();
    });
  } catch (error) {}
};

module.exports = { upload };
