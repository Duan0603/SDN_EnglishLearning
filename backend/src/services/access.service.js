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
    static checkExists = async ({ email, phone, username }) => {
        const result = { exists: false, field: null };
        if (email) {
            const found = await userModel.findOne({ email }).lean();
            if (found) return { exists: true, field: 'email' };
        }
        if (phone) {
            const found = await userModel.findOne({ phone }).lean();
            if (found) return { exists: true, field: 'phone' };
        }
        if (username) {
            const found = await userModel.findOne({ username }).lean();
            if (found) return { exists: true, field: 'username' };
        }
        return result;
    }

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
            throw new BadRequestError("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.")
        }

        // 2. Match password
        const match = await bcrypt.compare(password, foundUser.password)
        if (!match) {
            throw new BadRequestError("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.")
        }

        // 2FA check
        if (foundUser.isTwoFactorEnabled) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const { default: OtpModel } = await import("../models/otp.model.js");
            const { MailService } = await import("./mail.service.js");

            // Clean up previous OTPs and create new one
            await OtpModel.deleteMany({ email: foundUser.email });
            await OtpModel.create({ email: foundUser.email, otp: otpCode });

            // Send email
            console.log("\n==========================================");
            console.log(`[2FA OTP] Generated code for ${foundUser.email}: ${otpCode}`);
            console.log("==========================================\n");
            await MailService.sendOTP(foundUser.email, otpCode);

            return {
                requires2FA: true,
                require2FA: true,
                email: foundUser.email
            };
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
            user: getInfoData({field: ['_id', 'username', 'fullName', 'email', 'role', 'phone'], object: foundUser}),
            tokens
        }

    }

    static signUp = async ({username, email, password, fullName, birthday = '', phone, identityNumber = '', role = 'STUDENT'}) => {
        // Validate required fields
        if (!username || !email || !password || !phone) {
            throw new BadRequestError("Vui lòng điền đầy đủ thông tin!")
        }

        const holdUserByEmail = await userModel.findOne({email}).lean()
        if (holdUserByEmail) {
            throw new BadRequestError("Email này đã được sử dụng!")
        }

        const holdUserByUsername = await userModel.findOne({username}).lean()
        if (holdUserByUsername) {
            throw new BadRequestError("Tên người dùng đã tồn tại!")
        }
        
        const holdUserByPhone = await userModel.findOne({phone}).lean()
        if (holdUserByPhone) {
            throw new BadRequestError("Số điện thoại đã được sử dụng!")
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const status = role === 'MENTOR' ? 'pending' : 'active';

        //tao user moi
        const newUser = await userModel.create({
            username, 
            fullName: fullName || username, 
            email, 
            password: hashedPassword, 
            role: role,
            status: status,
            verify: false,
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
                throw new BadRequestError('Lỗi hệ thống mã hóa!')
            }

            console.log(`Create Token Success:: `, tokens)

            return {
                user: getInfoData({field: ['_id', 'username', 'fullName', 'email', 'role', 'phone'], object: newUser}),
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
            throw new BadRequestError("Tài khoản Google không cung cấp Email hợp lệ!");
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
            user: getInfoData({field: ['_id', 'username', 'fullName', 'email', 'role', 'phone', 'avatar'], object: user}),
            tokens
        };
    }

    static verify2FA = async ({ email, otp }) => {
        if (!email || !otp) {
            throw new BadRequestError("Vui lòng cung cấp đầy đủ email và mã xác thực!");
        }

        const { default: OtpModel } = await import("../models/otp.model.js");
        
        // Find OTP record
        const tokenRecord = await OtpModel.findOne({ email, otp }).lean();
        if (!tokenRecord) {
            throw new BadRequestError("Mã xác thực không hợp lệ hoặc đã hết hạn!");
        }

        // Fetch User
        const foundUser = await userModel.findOne({ email }).lean();
        if (!foundUser) {
            throw new BadRequestError("Không tìm thấy người dùng!");
        }

        // Clean up OTP record
        await OtpModel.deleteMany({ email });

        // Create key pair & generate tokens
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
        });

        const tokens = await createTokenPair({userId: foundUser._id, email: foundUser.email, role: foundUser.role}, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            userId: foundUser._id,
            publicKey,
            refreshToken: tokens.refreshToken
        });

        return {
            user: getInfoData({field: ['_id', 'username', 'fullName', 'email', 'role', 'phone'], object: foundUser}),
            tokens
        };
    }
}