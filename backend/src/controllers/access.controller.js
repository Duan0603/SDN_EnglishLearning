import {Created, OK} from "../core/success.response.js";
import {AccessService} from "../services/access.service.js";
import userModel from "../models/user.model.js";
export class AccessController {
    static checkExists = async (req, res, next) => {
        const metadata = await AccessService.checkExists(req.body);
        new OK({
            message: "Check exists success",
            metadata
        }).send(res);
    }

    static signUp = async (req, res, next) => {
        const metadata = await AccessService.signUp(req.body);
        
        if (metadata.tokens) {
            res.cookie('refreshToken', metadata.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            // Don't send refresh token in payload
            delete metadata.tokens.refreshToken;
        }

        new Created({
            message: "User registered successfully!",
            metadata
        }).send(res)
    }

    static signIn = async (req, res, next) => {
        const metadata = await AccessService.login(req.body);

        if (metadata.tokens) {
            res.cookie('refreshToken', metadata.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            // Don't send refresh token in payload
            delete metadata.tokens.refreshToken;
        }

        new OK({
            message: "Login success!",
            metadata
        }).send(res)
    }

    static googleLogin = async (req, res, next) => {
        const metadata = await AccessService.googleLogin(req.body);

        if (metadata.tokens) {
            res.cookie('refreshToken', metadata.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            // Don't send refresh token in payload
            delete metadata.tokens.refreshToken;
        }

        new OK({
            message: "Google Login success!",
            metadata
        }).send(res)
    }

    static logout = async (req, res, next) => {
        // Clear cookie
        res.clearCookie('refreshToken');
        
        // Remove token from DB
        const delKey = await AccessService.logout(req.keyStore);

        new OK({
            message: "Logout success!",
            metadata: delKey
        }).send(res)
    }

    static getProfile = async (req, res, next) => {
        const user = await userModel.findById(req.user.userId).lean();

        if (!user) {
            throw new Error("User not found");
        }

        new OK({
            message: "Get profile success!",
            metadata: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        }).send(res)
    }
}