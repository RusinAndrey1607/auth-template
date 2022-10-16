import { ApiError } from "../exceptions/apiErrors"
import { User } from "../models/models"
import bcrypt from "bcrypt"
import { v4 } from 'uuid'
import { mailService } from "./mailService"
import { tokenService } from "./tokenService"
import { UserDto } from "../dtos/userDto"

class AuthService {
    async registration(email: string, password: string) {
        const candidate = await User.findOne({ where: { email } })

        if (candidate) {
            throw ApiError.BadRequest(`User with ${email} already exists`)
        }

        const hashPassword = await bcrypt.hash(password, 6)
        const activationLink = v4()
        const user = await User.create({ email, password: hashPassword, activationLink })

        await mailService.sendActivationMail(email, `${process.env.API_URL}/auth/activate/${activationLink}`)
        const userDto = new UserDto(user)
        const tokens = await tokenService.generateTokens({ ...userDto })

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        }

    }
    async login(email: string, password: string) {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            throw ApiError.BadRequest(`User with email ${email} not found`)
        }
        const passwordEqual = await bcrypt.compare(password, user.password)

        if (!passwordEqual) {
            throw ApiError.BadRequest(`Incorect password`)

        }

        const userDto = new UserDto(user)
        const tokens = await tokenService.generateTokens({ ...userDto })

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }

    }

    async logout(refreshToken: string) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        const userData: any = await tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }

        const user = await User.findOne({
            where: {
                id: userData.id
            }
        })
        if (!user) {
            throw ApiError.BadRequest("User was deleted")
        }
        const userDto = new UserDto(user)
        const tokens = await tokenService.generateTokens({ ...userDto })

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }


    }

    async activate(activationLink: string) {
        const user = await User.findOne({
            where: {
                activationLink
            }
        })
        if (!user) {
            throw ApiError.BadRequest(`Uncorrect activation link`)

        }
        user.isActivated = true
        await user.save()
    }
    async sendActivationLink(user: UserDto) {
        try {
            const userData = await User.findOne({
                where: {
                    email: user.email
                }
            })
            const activationLink = userData?.activationLink

            if (activationLink) {
                await mailService.sendActivationMail(userData.email, `${process.env.API_URL}/auth/activate/${activationLink}`)
            }
            return userData


        } catch (error) {

        }
    }
    async getAll() {
        try {
            const users = await User.findAll()
            return users
        } catch (error) {
            return error

        }
    }
}

export const authService = new AuthService()