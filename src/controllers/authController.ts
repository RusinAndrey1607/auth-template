import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../exceptions/apiErrors";
import { authService } from '../services/authService';
//import { mailService } from '../services/mailService';
import { UserDto } from '../dtos/userDto';

class AuthController {
    async registration(req: Request, res: Response, next: Function) {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation Failed", errors.array()))
            }

            const { email, password } = req.body

            const userData = await authService.registration(email, password)

            res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData)
        } catch (error) {
            next(error)
        }
    }
    async login(req: Request, res: Response, next: Function) {
        try {
            const { email, password } = req.body
            const userData = await authService.login(email, password)

            res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData)

        } catch (error) {
            next(error)

        }
    }
    async logout(req: Request, res: Response, next: Function) {
        try {
            const { refreshToken } = req.cookies
            console.log(refreshToken);
            res.clearCookie("refreshToken")

            const token = await authService.logout(refreshToken)
            res.json(token)


        } catch (error) {
            next(error)

        }
    }
    async refresh(req: Request, res: Response, next: Function) {
        try {
            const { refreshToken } = req.cookies
            console.log(refreshToken);


            const userData = await authService.refresh(refreshToken)

            res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData)
        } catch (error) {
            next(error)

        }
    }
    async getAll(req: Request, res: Response, next: Function) {
        try {
            const users = await authService.getAll()
            res.json(users)
        } catch (error) {
            next(error)

        }
    }
    async activate(req: Request, res: Response, next: Function) {
        try {
            const { link } = req.params
            await authService.activate(link)
            res.redirect(`${process.env.FRONTEND_URL}`)
        } catch (error) {
            next(error)

        }
    }

    async sendActivationLink(req: Request, res: Response, next: Function) {
        try {
            // @ts-ignore
            const { user } = req
            const userData = await authService.sendActivationLink(user)

            res.json(userData)


        } catch (error) {
            next(error)

        }
    }


}

export const authController = new AuthController()
