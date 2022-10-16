import { Sequelize } from 'sequelize'
import { config } from "dotenv"
import { User } from '../models/models'
config()


const connectionString = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/node_postgress"


export const sequelize = new Sequelize(connectionString)

export const dbConnect = async () => {
    try {
        await sequelize.authenticate({logging:false})
        await sequelize.sync()
        console.log("Connect to database")
    } catch (error: any) {
        await sequelize.close()
        throw new Error(error)

    } 
}