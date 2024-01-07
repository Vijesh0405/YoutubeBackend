import mongoose from "mongoose"


const connectDB = async ()=>{
    try {
        const connectionInstance =  await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDb connected ! DB Host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MongoDb connection error=> ${error}`)
        process.exit(1)
    }
}
export {connectDB}