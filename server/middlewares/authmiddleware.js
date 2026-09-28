//middleware to check if user is logged in and who is he . 
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token; // Get JWT from HTTP-only cookie

        if (!token) {
            return res.sendStatus(401); // Not authenticated
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT

        req.userId = decoded.userId; // Attach authenticated user's ID to request

        next(); // Continue to protected controller
    } catch (err) {
        console.log("Invalid JWT:", err.message);
        return res.sendStatus(401); // Invalid/expired JWT
    }
};