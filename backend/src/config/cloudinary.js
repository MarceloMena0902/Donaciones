import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dglrvw9px",
  api_key: "979262992259473",
  api_secret: "GtCB-KFLGdoN5UP1_nVuXqfjxws",
  secure: true,
});

export default cloudinary;
export const uploadImage = (filePath) => {
  return cloudinary.uploader.upload(filePath, {
    folder: "donaciones",
  });
};