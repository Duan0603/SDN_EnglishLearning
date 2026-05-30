import bcrypt from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/user.model.js";
import {BadRequestError} from "../core/error.response.js";
import {Role} from "../data/data.js";
import createTokenPair from "../auth/authUtils.js";
import {KeyTokenService} from "./keyToken.service.js";
import {getInfoData} from "../ultils/index.js";

export class AccessService {
    static login = async ({email, password}) => {
        // 1. Check email or username in dbs
        const foundUser = await userModel.findOne({
            $or: [
                { email: email },
                { username: email }
            ]
        }).lean()
        if (!foundUser) {
            throw new BadRequestError("User not registered")
        }

        // 2. Match password
        const match = await bcrypt.compare(password, foundUser.password)
        if (!match) {
            throw new BadRequestError("Authentication failed")
        }

        // 3. Create privateKey, publicKey
        const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        })

        // 4. Generate tokens
        const tokens = await createTokenPair({userId: foundUser._id, email: foundUser.email}, publicKey, privateKey)

        // 5. Save tokens
        await KeyTokenService.createKeyToken({
            userId: foundUser._id,
            publicKey,
            refreshToken: tokens.refreshToken
        })

        return {
            user: getInfoData({field: ['_id', 'username', 'fullName', 'email'], object: foundUser}),
            tokens
        }

    }

    static signUp = async ({username, email, password, fullName}) => {
        // Validate required fields
        if (!username || !email || !password || !fullName) {
            throw new BadRequestError("username, email, password and fullName are required")
        }

        const holdUserByEmail = await userModel.findOne({email}).lean()
        if (holdUserByEmail) {
            throw new BadRequestError("User with this email already registered")
        }

        const holdUserByUsername = await userModel.findOne({username}).lean()
        if (holdUserByUsername) {
            throw new BadRequestError("Username already taken")
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        //tao user moi
        const newUser = await userModel.create({
            username, fullName, email, password: hashedPassword, role: Role.STUDENT
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
                user: getInfoData({field: ['_id', 'username', 'fullName', 'email'], object: newUser}),
                tokens
            }

        }

        return {
            user: null,
            tokens: null
        }
    }
}