import {z} from "zod";
import { confirmEmail, login, signup } from "./auth.validation";

// export interface LoginDTO {
//     email:string; 
//     password:string
// }


export type SignupDTO = z.infer<typeof signup.body>
export type LoginDTO = z.infer<typeof login.body>
export type ConfirmEmailDTO = z.infer<typeof confirmEmail.body>

// export interface SignupDTO extends LoginDTO{
//     username: string;
// }