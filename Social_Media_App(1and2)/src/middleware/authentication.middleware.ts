import type { NextFunction, Request, Response } from "express";
import { RoleEnum, TokenTypeEnum } from "../common/enum";
import { BadRequestException, ForbiddenException, UnauthorizedException } from "../common/exceptions";
import { TokenService } from "../common/services";



export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const tokenService: TokenService = new TokenService;
        const [schema, credentials] = req.headers.authorization?.split(" ") || [];
        if (!schema || !credentials) {
            throw new UnauthorizedException("Missing authentication key or invalid approach");
        }

        switch (schema) {
            case 'Bearer':
                const { user, decoded } = await tokenService.decodeToken({ token: credentials, tokenType });
                req.user = user;
                req.decoded = decoded;
                break;
            default:
                throw new BadRequestException("Missing authentication schema");
                break;
        }
        next();
    };
};

export const authorization = (accessRoles: RoleEnum[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!accessRoles.includes(req.user.role)) {
            throw new ForbiddenException("Not authorized account");
        }
        next();
    };
};