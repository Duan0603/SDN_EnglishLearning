import {Created, OK} from "../core/success.response.js";
import {AccessService} from "../services/access.service.js";
export class AccessController {
    static signUp = async (req, res, next) => {
        console.log(`[P]::signUp::`, req.body)

        new Created({
            message: "User registered successfully!",
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }

    static signIn = async (req, res, next) => {
        new OK({
            message: "Login success!",
            metadata: await AccessService.login(req.body)
        }).send(res)
    }
}