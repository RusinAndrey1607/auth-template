import nodemailer from "nodemailer"
class MailService {
    transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            // @ts-ignore
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
        
        
    }
    async sendActivationMail(to: string, link: string) {
        await this.transporter.sendMail({
            to,
            from: process.env.SMTP_USER,
            subject: `Account activation from ${process.env.API_URL}`,
            text: '',
            html: `
                <div>
                    <h1>
                        To activate your account click this link <a href=${link}>${link}</a>
                    </h1>
                    
                </div>
            `
        })
    }
}

export const mailService = new MailService()