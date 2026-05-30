import keyTokenModel from "../models/keyToken.model.js";


export class KeyTokenService {
    static createKeyToken = async ({userId, publicKey, refreshToken}) => {
        const publicKeyString = publicKey.toString()
        const tokens = await keyTokenModel.create({
                user: userId,
                publicKey: publicKeyString, refreshToken
        })

        return tokens ? publicKeyString : null
    }
}