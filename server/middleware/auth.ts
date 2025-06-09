import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès requis' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalide' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' })
  }
}