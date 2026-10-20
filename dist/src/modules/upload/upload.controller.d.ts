export declare class UploadController {
    uploadFile(file: Express.Multer.File): Promise<{
        message: string;
        data: {
            url: string;
            filename: string;
            mimetype: string;
            size: number;
        };
    }>;
}
