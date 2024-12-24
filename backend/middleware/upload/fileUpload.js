// middleware/upload/fileUpload.js

import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';
import crypto from 'crypto';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

class GoogleDriveService {
    constructor() {
        this.auth = null;
        this.drive = null;
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        this.initialize();
    }

    async initialize() {
        try {
            const client_email = process.env.GCP_CLIENT_EMAIL;
            const private_key = process.env.GCP_PRIVATE_KEY;

            this.auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email,
                    private_key
                },
                scopes: ['https://www.googleapis.com/auth/drive.file']
            });

            this.drive = google.drive({ version: 'v3', auth: this.auth });
        } catch (error) {
            console.error('Failed to initialize Google Drive:', error);
            throw error;
        }
    }

    bufferToStream(buffer) {
        return Readable.from(buffer);
    }

    async uploadFile(file) {
        try {
            // Create a readable stream from the buffer
            const fileStream = this.bufferToStream(file.buffer);
            
            const fileMetadata = {
                name: `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`,
                parents: [this.folderId]
            };

            const media = {
                mimeType: file.mimetype,
                body: fileStream
            };

            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id'
            });

            // Set file permissions to be readable by anyone with the link
            await this.drive.permissions.create({
                fileId: response.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            return {
                fileId: response.data.id,
                url: this.getViewUrl(response.data.id, file.mimetype)
            };
        } catch (error) {
            console.error('Failed to upload to Google Drive:', error);
            throw error;
        }
    }

    getViewUrl(fileId, mimeType) {
        switch(mimeType) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/gif':
            case 'application/pdf':
                return `https://drive.google.com/file/d/${fileId}/preview`;
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return `https://docs.google.com/document/d/${fileId}/preview`;
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
            default:
                return `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }
}

// Middleware for handling multiple file uploads
const handleMultipleFileUpload = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    const googleDriveService = new GoogleDriveService();
    const uploadedFiles = [];

    try {
        // Process each file in the request
        for (const file of req.files) {
            const result = await googleDriveService.uploadFile(file);
            uploadedFiles.push({
                drive_file_id: result.fileId,
                file_url: result.url,
                mime_type: file.mimetype,
                size: file.size,
                title: file.originalname
            });
        }

        req.uploadedFiles = uploadedFiles;
        next();
    } catch (error) {
        console.error('File upload error:', error);
        return res.status(400).json({ 
            message: 'File upload failed', 
            error: error.message 
        });
    }
};

// Single file upload handler
const handleFileUpload = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const googleDriveService = new GoogleDriveService();

    try {
        const result = await googleDriveService.uploadFile(req.file);
        
        req.uploadedFile = {
            drive_file_id: result.fileId,
            file_url: result.url,
            mime_type: req.file.mimetype,
            size: req.file.size,
            title: req.file.originalname
        };

        next();
    } catch (error) {
        console.error('File upload error:', error);
        return res.status(400).json({ 
            message: 'File upload failed', 
            error: error.message 
        });
    }
};

export const uploadMiddleware = {
    single: upload.single('file'),
    multiple: upload.array('files', 10),
    handleSingle: handleFileUpload,
    handleMultiple: handleMultipleFileUpload
};