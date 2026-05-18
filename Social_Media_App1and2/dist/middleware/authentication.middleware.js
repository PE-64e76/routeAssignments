"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const enum_1 = require("../common/enum");
const exceptions_1 = require("../common/exceptions");
const services_1 = require("../common/services");
const authentication = (tokenType = enum_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const tokenService = new services_1.TokenService;
        const [schema, credentials] = req.headers.authorization?.split(" ") || [];
        if (!schema || !credentials) {
            throw new exceptions_1.UnauthorizedException("Missing authentication key or invalid approach");
        }
        switch (schema) {
            case 'Bearer':
                const { user, decoded } = await tokenService.decodeToken({ token: credentials, tokenType });
                req.user = user;
                req.decoded = decoded;
                break;
            default:
                throw new exceptions_1.BadRequestException("Missing authentication schema");
                break;
        }
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRoles) => {
    return async (req, res, next) => {
        if (!accessRoles.includes(req.user.role)) {
            throw new exceptions_1.ForbiddenException("Not authorized account");
        }
        next();
    };
};
exports.authorization = authorization;
