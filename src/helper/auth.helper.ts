import { CookieSerializeOptions, serialize } from "cookie";
import Base64 from "crypto-js/enc-base64";
import HmacSHA256 from "crypto-js/hmac-sha256";
import { Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { Document } from "mongoose";

/**
 * It takes a string, hashes it with a secret key, and returns the hashed string
 * @param {string} password - The password that you want to hash.
 * @returns A string
 */
const hashPassword = (password: string) => {
    const newPass = Base64.stringify(
        HmacSHA256(password, process.env.JWT_TOKEN!)
    );
    return newPass;
};

/**
 * It takes in a current password and an encrypted password, hashes the current password, and compares
 * the two
 * @param {string} currentPass - The password that the user entered
 * @param {string} encryptedPass - The password that is stored in the database
 */
const verifyPassword = (currentPass: string, encryptedPass: string) => {
    const hashedPass = Base64.stringify(
        HmacSHA256(currentPass, process.env.JWT_TOKEN!)
    );

    return hashedPass === encryptedPass;
};

/**
 * It takes a user object and an object with a boolean property called isVerified. If isVerified is
 * true, it returns a signed token with the user's data. If isVerified is false, it returns a signed
 * token with the user's data minus the password, name, email, companyName, industryName, memberShip,
 * phoneNumber, photoURL, role, isIndividual, updatedAt, and _id properties
 * @param {any} user - any - The user object that you want to sign.
 * @param  - user: any - The user object that you want to sign.
 * @returns A signed token
 */
const signUserData = (
    user: any,
    { isVerified = true }: { isVerified?: boolean }
) => {
    const { password, previousDB, ...restUser } = user._doc;

    const {
        name,
        companyName,
        industryName,
        memberShip,
        phoneNumber,
        photoURL,
        role,
        isIndividual,
        updatedAt,
        _id,
        ...unVerifiedUser
    } = restUser;

    const payload = isVerified
        ? {
              ...restUser,
              isVerified: true,
          }
        : {
              ...unVerifiedUser,
          };

    const signedToken = jsonwebtoken.sign(payload, process.env.JWT_TOKEN!, {
        algorithm: "HS512",
        expiresIn: "30d",
    });

    return signedToken;
};

/**
 * It takes a user object, and returns a signed JWT token
 * @param user - Document<unknown, any, User.IUserSchema> & User.IUserSchema
 * @returns A token
 */
const getActivationToken = (user: Document<unknown, any, any> & any) => {
    const { _id, email, createdAt } = user;

    const token = jsonwebtoken.sign(
        { _id, email, createdAt },
        process.env.JWT_TOKEN!,
        {
            algorithm: "HS512",
            expiresIn: "11m",
        }
    );

    return token;
};

/**
 * It takes a token, verifies it, and returns an error if it's expired or the decoded token if it's not
 * @param {string} token - The token to verify
 * @param callback - (error: (null | string), decoded?: Jwt) => void
 * @returns The verify function is being returned.
 */
const verifyToken = (
    token: string,
    callback: (error: null | string, decoded?: jsonwebtoken.Jwt) => void
) => {
    return jsonwebtoken.verify(
        token,
        process.env.JWT_TOKEN!,
        { complete: true, algorithms: ["HS512"] },
        async (error, decoded) => {
            if (error) return callback("Token Expired!");
            return callback(null, decoded);
        }
    );
};

/**
 * It takes a response object, a cookie name, a cookie value, and an optional options object, and sets
 * the cookie on the response object
 * @param {Response} res - Response - this is the response object that Next.js gives us.
 * @param {string} name - The name of the cookie.
 * @param {unknown} value - The value of the cookie.
 * @param {CookieSerializeOptions} options - CookieSerializeOptions
 */
export const setCookie = (
    res: Response,
    name: string,
    value: unknown,
    options: CookieSerializeOptions = {}
) => {
    const stringValue =
        typeof value === "object"
            ? "j:" + JSON.stringify(value)
            : String(value);

    if (typeof options.maxAge === "number") {
        options.expires = new Date(Date.now() + options.maxAge * 1000);
    }
    options.path = "/";

    res.setHeader("Set-Cookie", serialize(name, stringValue, options));
};

/**
 * It generates a random number between 1000 and 9999 and returns it
 * @param [callback] - The callback function that will be called when the OTP is generated.
 */
export const generateOTP = (callback?: (otp: string) => void) => {
    if (typeof callback != "function") callback = () => {};

    let otp = "";
    let digits = "0123456789";

    for (let i = 0; i < 4; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    callback(otp);
    return otp;
};

/**
 * It takes in a data object, signs it with a secret key, and returns a token
 * @param {T | any} data - The data you want to sign.
 * @returns A token
 */
export async function getResetPasswordToken<T>(data: T | any) {
    const token = await jsonwebtoken.sign(data, process.env.JWT_TOKEN!, {
        algorithm: "HS512",
    });

    return token;
}

/**
 * It takes a token and an OTP and returns a boolean value
 * @param {string} token - The token that was sent to the user's email.
 * @param {string} otp - The OTP that the user has entered.
 * @returns A boolean value
 */
export async function verifyOTP(token: string, otp: string) {
    let bool = false;
    await jsonwebtoken.verify(
        token,
        process.env.JWT_TOKEN!,
        { complete: true, algorithms: ["HS512"] },
        async (error, decoded) => {
            if (error || !decoded) {
                bool = false;
                return;
            }
            console.log({ signature: decoded.signature });

            const { payload } = decoded;
            console.log({ payload, otp });
            if (typeof payload !== "string" && payload.otp) {
                if (payload.otp === otp) bool = true;
                else bool = false;
                return;
            } else {
                bool = false;
                return;
            }
        }
    );

    return bool;
}

export {
    verifyPassword,
    hashPassword,
    signUserData,
    getActivationToken,
    verifyToken,
};
