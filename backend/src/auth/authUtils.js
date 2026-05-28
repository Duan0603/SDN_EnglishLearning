import JWT from "jsonwebtoken";

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if(err){
                console.error(`error verify:: `, err)
            }else {
                console.log(`decode verify:: `, decode)
            }
        })
        return {accessToken, refreshToken}
    }catch (e) {
        throw e;
    }
}

const authentication = async (req, res, next) => {
    try {
        const userId = req.headers['x-client-id'];
        if (!userId) throw new Error('Missing x-client-id');

        const { KeyTokenService } = await import('../services/keyToken.service.js');
        const keyStore = await KeyTokenService.findByUserId(userId);
        if (!keyStore) throw new Error('Not found keyStore');

        const accessToken = req.headers['authorization'];
        if (!accessToken) throw new Error('Missing authorization');

        try {
            const decodeUser = JWT.verify(accessToken.replace('Bearer ', ''), keyStore.publicKey);
            if (userId !== decodeUser.userId) throw new Error('Invalid userId');
            req.keyStore = keyStore;
            req.user = decodeUser;
            return next();
        } catch (error) {
            throw error;
        }
    } catch (error) {
        next(error);
    }
}

export { createTokenPair, authentication }