// "use server"
// import axios from "axios"
// export interface SignUpPayload {
//     name: string
//     rollno: string
//     email: string
//     password: string
// }

// export interface LoginPayload {
//     email: string
//     rollno: string
//     password: string
// }

// export const signUpUser = async (payload: SignUpPayload) => {
//     try {
//         const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/sign-up`,
//             payload,
//             {
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         );
//         return response.data
//     } catch (error: any) {
//         const message =
//             error.response?.data?.message || "Something went wrong during signup";
//         throw new Error(message);
//     }
// }

// export const loginUser = async (payload: LoginPayload) => {
//     try {
//         console.log(process.env.NEXT_PUBLIC_BASE_URL);
//         const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`,
//             payload,
//             {
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         );
//         console.log(response.headers, response.status, response.data)
//         return response.data;
//     } catch (error: any) {
//         console.error("Login error:", error.response?.data?.message || error.message);
//         throw new Error(error.response?.data?.message || "Login failed");
//     }
// }

import axios from "axios"

export const axiosApiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_MODE === "development" ? process.env.NEXT_PUBLIC_BASE_URL : "/",
    withCredentials: true,
})