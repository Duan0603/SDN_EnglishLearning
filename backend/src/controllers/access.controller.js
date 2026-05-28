import {Created, OK} from "../core/success.response.js";
import {AccessService} from "../services/access.service.js";
export class AccessController {
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
}