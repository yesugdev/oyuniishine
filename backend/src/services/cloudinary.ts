import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  filePath: string,
  folder: string = 'children-showcase'
): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }],
  });
};

export const uploadVideo = async (
  filePath: string,
  folder: string = 'children-showcase/videos'
): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'video',
    transformation: [{ width: 1280, crop: 'limit', quality: 'auto' }],
  });
};

export const deleteMedia = async (publicId: string, resourceType: 'image' | 'video' = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export default cloudinary;
