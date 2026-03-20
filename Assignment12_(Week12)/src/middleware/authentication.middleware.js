import { tokenTypeEnum } from "../common/enums/security.enum.js"
import { BadRequestException, ForbiddenException } from "../common/utils/response/error.response.js"
import { decodeToken } from "../common/utils/security/token.security.js"

export const authentication = (tokenType = tokenTypeEnum.access) => {
    return async (req, res, next) => {
        if (!req?.headers?.authorization) {
            throw BadRequestException({message:"Missing authorization key"})
        }

        const {authorization} = req.headers
        console.log(authorization);
        const [flag , credential] = authorization.split(" ")
        if (!flag || !credential) {
            throw BadRequestException({message:"Missing authorization parts"})
        }
        console.log({flag , credential});
        switch (flag) {
            case 'Basic':
                const data = Buffer.from(credential, 'base64').toString();
                const {username, password} = data.split(":");
                console.log(data);
                console.log({username, password});
                break;

            case 'Bearer':
                req.user = await decodeToken({token: credential, tokenType})
                break;

            default:
                break;
            }
            next()
        } 
    }

export const authorization = (accessRoles = [], tokenType = tokenTypeEnum.access) => {
    return async (req, res, next) => {
        if (!req?.headers?.authorization) {
            throw BadRequestException({message:"Missing authorization key"})
        }
        req.user = await decodeToken({token: req.headers?.authorization, tokenType})
        console.log(req.user.role);
        if (!accessRoles.includes(req.user.role)) {
            throw ForbiddenException({message:"Not allowed account"})
        }
        next()
    }
}