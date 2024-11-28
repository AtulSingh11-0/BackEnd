const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary").cloudinary;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "online-medicine-shop/prescriptions/",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(
      new Error("Invalid file type. Only JPG, PNG and PDF files are allowed."),
      false
    );
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File size cannot be larger than 5MB",
      });
    }
  }
  next(err);
};

module.exports = { upload, handleMulterError };
