// src/utils/cloudinary.js

export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ml_default"); // Replace with your actual unsigned preset

  const res = await fetch("https://api.cloudinary.com/v1_1/dovyqaltq/image/upload", {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Upload failed");
  return json.secure_url;
};
