import express, { Router } from "express";
import "dotenv/config";
import { isAdmin } from "./middlewares/authMidd.js";
/* import routerAuthore from "./router/user.routes.js";
import routerPost from "./router/post.routes.js";
import likeRouter from './router/like.routes.js'; */
import routerUser from "./router/user.routes.js";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
import googleStrategy from "./middlewares/passport.config.js";
import passport from "passport";
import routerMachine from "./router/machine.routes.js";
import routerCPU from "./router/cpu.routes.js";
import routerCase from "./router/case.routes.js";
import routerCooler from "./router/cooler.routes.js";
import routerGPU from "./router/gpu.routes.js";
import routerMB from "./router/mb.routes.js";
import routerPower from "./router/power.routes.js";
import routerRAM from "./router/ram.routes.js";
import routerStorage from "./router/storage.routes.js";
import routerAdmin from "./router/presetmachine.routes.js";
import routerMedia from "./router/media.routes.js";
import routerMediaPublic from "./router/mediaPublic.routes.js";
import contactRoutes from "./router/contact.routes.js";
import routerCustomMachines from "./router/customMachine.routes.js";
import routerOrder from './router/order.routes.js';


const app = express()
passport.use(googleStrategy);
app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.url}`);
    next();
});


app.use(cors({
    origin: ['http://localhost:3000',
        '',
        ''],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use('/api/v1', routerMediaPublic);
app.use('/api/v1/', contactRoutes);
app.use('/api/v1', routerCustomMachines);
/* app.use("/api", routerAuthore);
app.use("/api", routerPost);
app.use('/api', likeRouter); */
app.use('/api/v1', routerUser);
app.use('/api/v1', routerMachine);
app.use('/api/v1', routerCPU);
app.use('/api/v1', routerCase);
app.use('/api/v1', routerCooler);
app.use('/api/v1', routerGPU);
app.use('/api/v1', routerMB);
app.use('/api/v1', routerPower);
app.use('/api/v1', routerRAM);
app.use('/api/v1', routerStorage);
app.use('/api/v1', routerOrder);
app.use('/api/v1', routerAdmin);
app.use('/api/v1', routerMedia);


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_STRING)
    .then(() => console.log("Connesso a MongoDB"))
    .catch(err => console.error("Errore di connessione:", err));

mongoose.connection.on("connected", () => {
    console.log("connesso a mongoDB")
});
mongoose.connection.on("error", (err) => {
    console.log("errore di connessione a mongo", err)
});
dotenv.config();

const PORT = process.env.PORT || 5020;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});