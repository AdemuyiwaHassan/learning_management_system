import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { type IUser, type userRoles } from "../models/user";

export interface AuthRequest extends Request {
  user?: IUser;
}

//Protect routes middleware to verify JWT token and attach user to request object
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  //check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = (await User.findById(decoded.userId).select(
        "-password",
      )) as IUser;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

/**
 * Accept a list of allowed roles (e.g "admin", "lecturer")
 * usage: router.post("/", protect, authorize("admin"), createLevel);
 */

export const authorize = (roles: userRoles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no user attached to request",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};
