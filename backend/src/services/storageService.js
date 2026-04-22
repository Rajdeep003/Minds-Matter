const path = require("path");

const toPublicUrl = (filename) => {
  if (!filename) {
    return "";
  }

  return `/uploads/${filename}`;
};

const buildStoredFile = (file) => {
  if (!file) {
    return null;
  }

  return {
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    publicUrl: toPublicUrl(path.basename(file.filename)),
  };
};

module.exports = { toPublicUrl, buildStoredFile };
