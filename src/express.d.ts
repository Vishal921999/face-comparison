// src/express.d.ts
declare namespace Express {
    interface MulterFile {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  
    interface Request {
      files?: MulterFile[];
    }
  }
  