import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

// "upload" = publicly viewable by URL (current behavior).
// Change to "authenticated" later to lock files down. Once you do, the stored
// documentUrl stops working and you must return getSignedUrl(...) instead.
const DELIVERY_TYPE = "upload" as const;

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
        type: DELIVERY_TYPE,
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

// PDFs are stored as "raw" and images as "image", so try image first and
// fall back to raw if Cloudinary reports the asset wasn't found.
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  const asImage = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    type: DELIVERY_TYPE,
  });

  if (asImage.result === "not found") {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      type: DELIVERY_TYPE,
    });
  }
};

// Only needed once DELIVERY_TYPE is "authenticated".
export const getSignedUrl = (
  publicId: string,
  resourceType: "image" | "raw" = "image",
): string => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: DELIVERY_TYPE,
    sign_url: true,
    secure: true,
  });
};
