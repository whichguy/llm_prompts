/**
 * API Routes Configuration
 * TypeScript implementation for REST API endpoints
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { UserService } from './user-service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class ApiRoutes {
  private router: Router;
  private userService: UserService;

  constructor(userService: UserService) {
    this.router = express.Router();
    this.userService = userService;
    this.setupRoutes();
  }

  /**
   * Setup all API routes
   * TODO: Add rate limiting middleware
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.router.get('/health', this.healthCheck);

    // User routes
    this.router.get('/users', this.authenticate, this.getUsers);
    this.router.get('/users/:id', this.authenticate, this.getUser);
    this.router.post('/users', this.createUser);
    this.router.put('/users/:id', this.authenticate, this.updateUser);
    this.router.delete('/users/:id', this.authenticate, this.adminOnly, this.deleteUser);

    // TODO: Add password reset endpoints
    // TODO: Add email verification endpoints
    // FIXME: Add proper error handling middleware
  }

  /**
   * Health check endpoint
   */
  private healthCheck(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }

  /**
   * Authentication middleware
   * BREAKING CHANGE: Now requires Bearer token instead of API key
   */
  private authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // TODO: Implement actual JWT verification
    // FIXME: This is just a mock implementation
    req.user = {
      id: '123',
      email: 'user@example.com',
      role: 'user'
    };
    
    next();
  }

  /**
   * Admin-only middleware
   */
  private adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  }

  /**
   * Get all users
   * FIXME: Add pagination
   */
  private async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await this.userService.searchUsers({
        query: req.query.q as string || '',
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0
      });

      res.json({
        success: true,
        data: users,
        total: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  }

  /**
   * Get single user
   */
  private async getUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  }

  /**
   * Create new user
   * TODO: Add input validation
   * TODO: Send welcome email
   */
  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update user
   */
  private async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Users can only update their own profile unless admin
      if (req.user?.id !== req.params.id && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const user = await this.userService.updateUser(req.params.id, req.body);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete user (admin only)
   * BREAKING CHANGE: Now returns 204 instead of 200
   */
  private async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  }

  /**
   * Get router instance
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default ApiRoutes;