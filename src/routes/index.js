import userRouter from './user.routes.js'
import videoRouter from './video.routes.js'
import subscriptionRouter from './subscription.routes.js'
import { healthcheck } from '../controllers/healthCheck.controllers.js'

export {userRouter,videoRouter,watchRouter,subscriptionRouter}