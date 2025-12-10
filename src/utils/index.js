require('dotenv').config(); // penting kalau .env belum dimuat
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const streamifier = require('streamifier');

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage khusus untuk file PDF
const storage = new CloudinaryStorage(
    {
        cloudinary: cloudinary,
        params: {
            folder: 'surat', // Folder di Cloudinary
            resource_type: 'raw', // penting untuk file PDF
            format: async () => 'pdf', // jika kamu ingin pastikan hanya PDF
            public_id: (req, file) => `${Date.now()}-${file.originalname}`,
        },
    });

// Multer pakai memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        console.log(file)
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('File harus berupa PDF.'));
        }
    }
});

// Fungsi upload ke Cloudinary
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                folder: 'surat',
                public_id: filename.replace(/\.pdf$/, ''),
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const requestResponse = {
    success: {
        code: 200,
        status: true,
        message: 'BERHASIL MEMUAT PERMINTAAN'
    },
    incomplete_body: {
        code: 400,
        status: false,
        message: 'PERMINTAAN DALAM MASALAH, CEK PERMINTAAN ANDA'
    },
    unauthorized: {
        code: 401,
        status: false,
        message: 'UNAUTHORIZED'
    },
    not_found: {
        code: 404,
        status: false,
        message: 'FILE TIDAK DITEMUKAN'
    },
    unprocessable_entity: {
        code: 422,
        status: false,
        message: 'PERMINTAAN TIDAK DAPAT DI PROSES'
    },
    server_error: {
        code: 500,
        status: false,
        message: 'SERVER DALAM GANGGUAN, SILAHKAN KONTAK ADMINISTRATOR'
    },
};

module.exports = {
    requestResponse,
    cloudinary,
    uploadToCloudinary,
    upload
};
