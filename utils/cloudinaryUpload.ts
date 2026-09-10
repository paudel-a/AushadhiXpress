import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (
  buffer: Buffer,
  mimetype: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === "application/pdf" ? "raw" : "image";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "aushadiexpress/prescriptions",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};
