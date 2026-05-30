import keyTokenModel from "../models/keyToken.model.js";


export class KeyTokenService {
    static createKeyToken = async ({userId, publicKey, refreshToken}) => {
        const publicKeyString = publicKey.toString()
        const tokens = await keyTokenModel.create({
                user: userId,
                publicKey: publicKeyString, 
                refreshToken: refreshToken ? [refreshToken] : []
        })

        return tokens ? publicKeyString : null
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: userId }).lean()
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({ _id: id })
    }
}