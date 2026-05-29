const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'skillsphere/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }]
  }
});
const portfolioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'skillsphere/portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
  }
});
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'skillsphere/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type:   'raw'
  }
});
const uploadAvatar    = multer({ storage: avatarStorage });
const uploadPortfolio = multer({ storage: portfolioStorage });
const uploadResume    = multer({ storage: resumeStorage });

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadPortfolio,
  uploadResume
};