import bcrypt from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/user.model.js";
import {BadRequestError} from "../core/error.response.js";
import {Role} from "../data/data.js";
import { createTokenPair } from "../auth/authUtils.js";
import {KeyTokenService} from "./keyToken.service.js";
import {getInfoData} from "../ultils/index.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AccessService {
    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        return delKey;
    }

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
        const tokens = await createTokenPair({userId: foundUser._id, email: foundUser.email, role: foundUser.role}, publicKey, privateKey)

        // 5. Save tokens
        await KeyTokenService.createKeyToken({
            userId: foundUser._id,
            publicKey,
            refreshToken: tokens.refreshToken
        })

        return {
            user: getInfoData({field: ['_id', 'username', 'fullName', 'email', 'role', 'birthday', 'phone', 'identityNumber'], object: foundUser}),
            tokens
        }

    }

    static signUp = async ({username, email, password, fullName, birthday, phone, identityNumber}) => {
        // Validate required fields
        if (!username || !email || !password || !fullName || !birthday || !phone || !identityNumber) {
            throw new BadRequestError("username, email, password, fullName, birthday, phone and identityNumber are required")
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
            username, 
            fullName, 
            email, 
            password: hashedPassword, 
            role: Role.STUDENT,
            birthday,
            phone,
            identityNumber
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

            const tokens = await createTokenPair({userId: newUser._id, email, role: newUser.role}, publicKey, privateKey);

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
                user: getInfoData({field: ['_id', 'username', 'fullName', 'email', 'role', 'birthday', 'phone', 'identityNumber'], object: newUser}),
                tokens
            }

        }

        return {
            user: null,
            tokens: null
        }
    }

    static googleLogin = async ({ idToken }) => {
        // 1. Verify token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        if (!email) {
            throw new BadRequestError("Google token does not contain email");
        }

        // 2. Find or create user
        let user = await userModel.findOne({ email }).lean();
        if (!user) {
            const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
            user = await userModel.create({
                username: email.split('@')[0] + '_' + sub.substring(0, 5),
                fullName: name || '',
                email: email,
                password: hashedPassword,
                role: Role.STUDENT,
                avatar: picture || ''
            });
        }

        // 3. Create tokens
        const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
        });

        const tokens = await createTokenPair({userId: user._id, email: user.email, role: user.role}, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            userId: user._id,
            publicKey,
            refreshToken: tokens.refreshToken
        });

        return {
            user: getInfoData({field: ['_id', 'username', 'fullName', 'email', 'role', 'birthday', 'phone', 'identityNumber', 'avatar'], object: user}),
            tokens
        };
    }
}