import passport from "passport";
import {
    Strategy as JwtStrategy,
    ExtractJwt,
    StrategyOptions,
} from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import pool from "../config/database";

// Utility function to safely retrieve environment variables
const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};

// JWT Strategy Options
const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: getEnvVariable("JWT_SECRET"),
};

// JWT Strategy
passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
            const result = await pool.query(
                "SELECT * FROM users WHERE id = $1",
                [jwtPayload.id],
            );
            const user = result.rows[0];

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }),
);

// TODO: Implement Google OAuth

// Google OAuth Strategy
// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: getEnvVariable("GOOGLE_CLIENT_ID"),
//             clientSecret: getEnvVariable("GOOGLE_CLIENT_SECRET"),
//             callbackURL: "/api/auth/google/callback",
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 const result = await pool.query(
//                     "SELECT * FROM users WHERE google_id = $1",
//                     [profile.id],
//                 );
//                 let user = result.rows[0];

//                 if (!user) {
//                     const email = profile.emails?.[0]?.value || null;
//                     user = (
//                         await pool.query(
//                             "INSERT INTO users (email, google_id) VALUES ($1, $2) RETURNING *",
//                             [email, profile.id],
//                         )
//                     ).rows[0];
//                 }

//                 const token = jwt.sign(
//                     { id: user.id },
//                     getEnvVariable("JWT_SECRET"),
//                     { expiresIn: "1h" },
//                 );
//                 return done(null, { ...user, token });
//             } catch (error) {
//                 return done(error, false);
//             }
//         },
//     ),
// );

export default passport;
