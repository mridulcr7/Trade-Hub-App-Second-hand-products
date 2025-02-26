import multer from "multer";

// Set up storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/");
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

const storage = multer.memoryStorage();

export const upload = multer({ storage });
