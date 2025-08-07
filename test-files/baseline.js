/**
 * Baseline test file for agent-watch testing
 * This file should NOT trigger any agents initially
 */

class BaselineService {
  constructor() {
    this.data = [];
    // TODO: Add data validation
  }

  addItem(item) {
    // TODO: Validate item before adding
    this.data.push(item);
    return this.data.length;
  }

  getItems() {
    // FIXME: Should return copy to prevent mutation
    return this.data;
  }

  clearAll() {
    this.data = [];
    // TODO: Add logging for audit trail
  }
}

module.exports = BaselineService;