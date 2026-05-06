"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutEnum = exports.TokenTypeEnum = void 0;
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum[TokenTypeEnum["ACCESS"] = 0] = "ACCESS";
    TokenTypeEnum[TokenTypeEnum["REFRESH"] = 1] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
;
var logoutEnum;
(function (logoutEnum) {
    logoutEnum[logoutEnum["All"] = 0] = "All";
    logoutEnum[logoutEnum["ONE"] = 1] = "ONE";
})(logoutEnum || (exports.logoutEnum = logoutEnum = {}));
;
