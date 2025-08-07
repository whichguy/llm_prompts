/**
 * User Service - Test file for PR Summary Agent
 * This file contains user management logic with various patterns
 */

class UserService {
  constructor(database) {
    this.db = database;
    this.cache = new Map();
    // TODO: Implement cache expiration
    // TODO: Add metrics collection
  }

  /**
   * Get user by ID
   * BREAKING CHANGE: Now returns promise instead of callback
   */
  async getUserById(userId) {
    // Check cache first
    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }

    // FIXME: Add proper error handling
    const user = await this.db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (user) {
      this.cache.set(userId, user);
    }
    
    return user;
  }

  /**
   * Create new user
   * TODO: Add email verification
   */
  async createUser(userData) {
    const { email, name, password } = userData;
    
    // Basic validation
    if (!email || !name || !password) {
      throw new Error('Missing required fields');
    }

    // FIXME: Hash password before storing
    const result = await this.db.query(
      'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
      [email, name, password]
    );

    return { id: result.insertId, email, name };
  }

  /**
   * Update user profile
   */
  async updateUser(userId, updates) {
    // TODO: Add validation for update fields
    const allowedFields = ['name', 'email', 'bio', 'avatar'];
    const updateFields = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    }

    await this.db.query(
      'UPDATE users SET ? WHERE id = ?',
      [updateFields, userId]
    );

    // Clear cache
    this.cache.delete(userId);
    
    return this.getUserById(userId);
  }

  /**
   * Delete user account
   * BREAKING CHANGE: Now performs soft delete instead of hard delete
   */
  async deleteUser(userId) {
    // Soft delete by setting deleted_at timestamp
    await this.db.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = ?',
      [userId]
    );
    
    this.cache.delete(userId);
    
    return { success: true, message: 'User deleted successfully' };
  }

  /**
   * Search users by criteria
   */
  async searchUsers(criteria) {
    const { query, limit = 20, offset = 0 } = criteria;
    
    // TODO: Implement full-text search
    // FIXME: SQL injection vulnerability
    const sql = `
      SELECT id, name, email, created_at 
      FROM users 
      WHERE name LIKE '%${query}%' OR email LIKE '%${query}%'
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return this.db.query(sql);
  }
}

module.exports = UserService;