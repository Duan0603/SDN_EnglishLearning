import _ from 'lodash'


//lam gon code, cusstom field tra ve
export const getInfoData = ({field = [], object = {}}) => {
    return _.pick(object, field)
}