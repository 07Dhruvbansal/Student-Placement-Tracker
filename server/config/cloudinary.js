const cloudinary = require('cloudinary').v2;

const getCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
};

const uploadResume = (buffer) => new Promise((resolve, reject) => {
  const client = getCloudinary();
  const uploadStream = client.uploader.upload_stream(
    {
      resource_type: 'raw',
      type: 'authenticated',
      folder: 'placement-resumes',
      use_filename: false,
      unique_filename: true,
    },
    (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({ publicId: result.public_id, format: result.format });
      }
    }
  );
  uploadStream.end(buffer);
});

const createResumeDownloadUrl = (publicId, format) => getCloudinary().utils.private_download_url(
  publicId,
  format,
  {
    resource_type: 'raw',
    type: 'authenticated',
    attachment: true,
  }
);

const deleteResume = (publicId) => getCloudinary().uploader.destroy(publicId, {
  resource_type: 'raw',
  type: 'authenticated',
});

module.exports = { uploadResume, createResumeDownloadUrl, deleteResume };
