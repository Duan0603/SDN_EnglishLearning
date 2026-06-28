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
                avatar: user.avatar,
                birthday: user.birthday,
                phone: user.phone,
                identityNumber: user.identityNumber,
                bio: user.bio,
                expertise: user.expertise
            }
        }).send(res)
    }

    static updateProfile = async (req, res, next) => {
        const { prisma } = await import("../config/prisma.config.js");
        const { fullName, birthday, phone, identityNumber, bio, expertise, avatar } = req.body;
        
        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (birthday !== undefined) updateData.birthday = birthday;
        if (phone !== undefined) updateData.phone = phone;
        if (identityNumber !== undefined) updateData.identityNumber = identityNumber;
        if (bio !== undefined) updateData.bio = bio;
        if (expertise !== undefined) updateData.expertise = expertise;
        if (avatar !== undefined) updateData.avatar = avatar;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData
        });

        new OK({
            message: "Profile updated successfully!",
            metadata: {
                _id: updatedUser.id,
                username: updatedUser.username,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                birthday: updatedUser.birthday,
                phone: updatedUser.phone,
                identityNumber: updatedUser.identityNumber,
                bio: updatedUser.bio,
                expertise: updatedUser.expertise
            }
        }).send(res);
    }

    static uploadAvatar = async (req, res, next) => {
        try {
            const { image } = req.body;
            if (!image) {
                throw new Error("No image data provided");
            }

            // Reload dotenv dynamically to ensure new env variables are read without restarting server
            const dotenv = await import("dotenv");
            dotenv.config();

            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.CLOUDINARY_API_KEY;
            const apiSecret = process.env.CLOUDINARY_API_SECRET;

            if (!cloudName || !apiKey || !apiSecret) {
                throw new Error("Cloudinary credentials are not configured");
            }

            // Generate signature
            const timestamp = Math.round(new Date().getTime() / 1000);
            const paramsToSign = `timestamp=${timestamp}`;
            const crypto = await import("crypto");
            const signature = crypto
                .createHash("sha1")
                .update(paramsToSign + apiSecret)
                .digest("hex");

            // Send upload request to Cloudinary REST API
            const axios = (await import("axios")).default;
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    file: image,
                    api_key: apiKey,
                    timestamp: timestamp,
                    signature: signature
                }
            );

            const avatarUrl = response.data.secure_url;

            // Save to Database using prisma
            const { prisma } = await import("../config/prisma.config.js");
            const updatedUser = await prisma.user.update({
                where: { id: req.user.userId },
                data: { avatar: avatarUrl }
            });

            new OK({
                message: "Avatar uploaded successfully!",
                metadata: {
                    avatar: avatarUrl,
                    user: {
                        _id: updatedUser.id,
                        username: updatedUser.username,
                        fullName: updatedUser.fullName,
                        email: updatedUser.email,
                        role: updatedUser.role,
                        avatar: updatedUser.avatar,
                        birthday: updatedUser.birthday,
                        phone: updatedUser.phone
                    }
                }
            }).send(res);
        } catch (err) {
            console.error("Error in uploadAvatar controller:", err);
            next(err);
        }
    }
}