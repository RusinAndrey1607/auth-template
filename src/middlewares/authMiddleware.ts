import { Request, Response } from "express";
import { ApiError } from "../exceptions/apiErrors";
import { tokenService } from '../services/tokenService';

export const authMiddleware = async (req: Request, res: Response, next: any) => {
    if (req.method === "OPTIONS") {
        return next();

    }
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return next(ApiError.UnauthorizedError())
        }


        const decodedData = await tokenService.validateAccessToken(token)


        if (!decodedData) {
            return next(ApiError.UnauthorizedError())
        }
        // @ts-ignore
        req.user = decodedData
        next()

    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
}