import bcrypt from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/user.model.js";
import {BadRequestError} from "../core/error.response.js";
import {Role} from "../data/data.js";
import createTokenPair from "../auth/authUtils.js";
import {KeyTokenService} from "./keyToken.service.js";
import {getInfoData} from "../ultils/index.js";

export class AccessService {
    static signUp = async ({name, email, password}) => {
        // Validate required fields
        if (!name || !email || !password) {
            throw new BadRequestError("name, email and password are required")
        }

        const holdShop = await userModel.findOne({email}).lean()

        if(holdShop){
            //nem ra global error handling
            throw new BadRequestError("User already registered")
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        //tao user mooi
        const newUser = await userModel.create({
            name, email, password: hashedPassword, role: [Role.STUDENT]
        })

        if(newUser){
            //tao privateKey, publicKey
            const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096, //tang do phuc tap cua thuat toan, so cang to cpu xu ly cang nhieu
                publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            })

            console.log({privateKey, publicKey})

            const tokens = await createTokenPair({userId: newUser._id, email}, publicKey, privateKey);

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newUser._id,
                publicKey,
                refreshToken: tokens.refreshToken
            })

            if(!publicKeyString){
                throw new BadRequestError('Public key error !')
            }

            console.log(`Create Token Success:: `, tokens)

            return {
                code: 201,
                metadata: {
                    user: getInfoData({field: ['_id', 'name', 'email'], object: newUser}),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }
    }
}