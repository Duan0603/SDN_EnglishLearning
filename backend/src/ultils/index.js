import _ from 'lodash'


//lam gon code, cusstom field tra ve
export const getInfoData = ({field = [], object = {}}) => {
    const plainObj = object && typeof object.toObject === 'function' ? object.toObject() : object;
    return _.pick(plainObj, field)
}