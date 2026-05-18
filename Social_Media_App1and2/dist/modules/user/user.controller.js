"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../common/response");
const user_service_1 = __importDefault(require("./user.service"));
const middleware_1 = require("../../middleware");
const user_authorization_1 = require("./user.authorization");
const enum_1 = require("../../common/enum");
const validators = __importStar(require("./user.validation"));
const router = (0, express_1.Router)();
router.post("/logout", (0, middleware_1.authentication)(), async (req, res, next) => {
    const status = await user_service_1.default.logout(req.body.flag, req.user, req.decoded);
    return (0, response_1.successResponse)({ res, status });
});
router.get("/", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_authorization_1.endpoint.profile), async (req, res, next) => {
    const data = await user_service_1.default.profile(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.post("/rotate-token", (0, middleware_1.authentication)(enum_1.TokenTypeEnum.REFRESH), async (req, res, next) => {
    const credentials = await user_service_1.default.rotateToken(req.user, req.decoded, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({ res, status: 201, data: { ...credentials } });
});
router.patch("/password", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.updatePassword), async (req, res, next) => {
    const credentials = await user_service_1.default.updatePassword(req.body, req.user, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({ res, data: { ...credentials } });
});
exports.default = router;
