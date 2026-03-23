import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseProps } from "@/types";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  file: { uri?: string } | string,
  folderName: string,
): Promise<ResponseProps> => {
  try {
    if (typeof file === "string") {
      if (file.startsWith("http")) {
        return { success: true, data: file };
      } else {
        file = { uri: file };
      }
    }

    if (file && file.uri) {
      //ready to upload
      const formData = new FormData();
      formData.append("file", {
        uri: file?.uri,
        type: "image/jpeg",
        name: file?.uri?.split("/").pop() || "file.jpeg",
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folderName);

      const response = await fetch(CLOUDINARY_API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Cloudinary Error:", data);
        return { success: false, msg: data.error?.message || "Upload failed" };
      }

      return { success: true, data: data.secure_url };
    }
    return { success: true, data: null };
  } catch (error: any) {
    console.log("Got error uploading file.");
    return {
      success: false,
      msg: error.message || "Could not upload the file.",
    };
  }
};

export const getAvatarPath = (file: any, isGroup = false) => {
  if (file && typeof file === "string") {
    return { uri: file };
  }

  // 2. If it's an object from ImagePicker, return the formatted uri
  if (file && typeof file === "object" && file.uri) {
    return { uri: file.uri };
  }

  if (isGroup) return require("../assets/images/defaultGroupAvatar.png");

  return require("../assets/images/defaultAvatar.png");
};
