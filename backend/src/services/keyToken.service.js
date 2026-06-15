import keyTokenModel from "../models/keyToken.model.js";


export class KeyTokenService {
    static createKeyToken = async ({userId, publicKey, refreshToken}) => {
        try {
            const publicKeyString = publicKey.toString()
            const filter = { user: userId };
            const update = {
                publicKey: publicKeyString,
                refreshTokensUsed: [],
                refreshToken: refreshToken ? [refreshToken] : []
            };
            const options = { upsert: true, new: true };
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            console.error("createKeyToken error:", error);
            throw error;
        }
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: userId }).lean()
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({ _id: id })
    }
}