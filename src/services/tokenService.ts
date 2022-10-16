import jwt from 'jsonwebtoken'
import { UserDto } from '../dtos/userDto'
import { Token } from '../models/models'

class TokenService {
    async generateTokens(payload: UserDto) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY || "secret", { expiresIn: "30m" })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY || "secret", { expiresIn: "30m" })

        return {
            accessToken, refreshToken
        }
    }
    async saveToken(userId: number, refreshToken: string) {

        const tokenData = await Token.findOne({
            where: {
                user: userId
            }
        })

        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return await tokenData.save()
        }

        const token = await Token.create({
            user: userId, refreshToken
        })

        return token
    }
    async removeToken(refreshToken: string) {
        const token = await Token.destroy({
            where: {
                refreshToken
            },

        })
        return token
    }

    async validateRefreshToken(refreshToken: string) {
        try {
            // @ts-ignore
            const userData = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY)
            return userData

        } catch (error) {
            return null

        }
    }
    async validateAccessToken(accessToken: string) {
        try {
            // @ts-ignore
            const userData = await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY)

            return userData
        } catch (error) {
            return null
        }
    }
    async findToken(refreshToken: string) {
        const token = await Token.findOne({
            where: {
                refreshToken
            }
        })
        return token
    }
}

export const tokenService = new TokenService()