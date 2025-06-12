import * as express from "express";
import multer from "multer";

declare global {
    namespace Express {
        interface User {
            id: number;
            role: "USER" | "ADMIN";
        }

        interface Request {
            user?: User;
            file?: Express.Multer.File;
        }
    }
}