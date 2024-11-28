const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Function to generate unique filename
const generateUniqueFileName = (file) => {
  console.log(`
    Method started
    File: ${file.originalname}`);

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = file.originalname.split(".").pop();
  return `online-medicine-shop/prescriptions/prescription-${uniqueSuffix}.${fileExtension}`;
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    public_id: (req, file) => {
      const fileName = generateUniqueFileName(file);
      console.log(`File name: ${fileName}`);
      return fileName;
    },
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };
