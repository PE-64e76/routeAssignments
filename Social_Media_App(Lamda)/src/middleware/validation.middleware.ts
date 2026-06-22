import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../common/exceptions";
import type { ZodError, ZodType } from "zod";

type KeyReqType = keyof Request
type SchemaType = Partial<Record<KeyReqType, ZodType>>
type IssuesType = Array <{
    key: KeyReqType,
    issues: Array<{
        message: string,
        path: Array<string | number | symbol | undefined>
    }>
}>

export const validation = (schema: SchemaType) =>{
    return (req:Request, res:Response, next: NextFunction) => {
        const issues: IssuesType = []
        for(const key of Object.keys(schema) as KeyReqType[]){
            if (!schema[key]) continue;
            if (req.file) {
                req.body.file= req.file
            }
            if (req.files) {
                req.body.files= req.files
            }
            const validationResult = schema[key].safeParse(req[key])
            if (!validationResult.success) {
                const error = validationResult.error as ZodError
                issues.push({key, issues: error.issues.map(issue => {return {path: issue.path, message: issue.message}})})
            }
        }
        if (issues.length) {
            throw new BadRequestException("Validation error", {issues})
        }
        next()
    }
}