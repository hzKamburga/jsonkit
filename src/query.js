/**
 * Query Builder for JSONKit
 * Provides powerful query capabilities for JSON data
 */

export class Query {
  /**
   * Match documents against a query
   */
  static match(collection, query) {
    return collection.filter(doc => this.matchOne(doc, query));
  }

  /**
   * Check if a single document matches a query
   */
  static matchOne(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      // Handle operators
      if (key.startsWith('$')) {
        if (!this.handleOperator(doc, key, value)) {
          return false;
        }
        continue;
      }

      // Handle nested queries
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (!this.matchNested(doc[key], value)) {
          return false;
        }
        continue;
      }

      // Simple equality check
      if (doc[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle nested query matching
   */
  static matchNested(docValue, queryValue) {
    // Check for operators in nested query
    for (const [key, value] of Object.entries(queryValue)) {
      if (key.startsWith('$')) {
        return this.handleFieldOperator(docValue, key, value);
      }
    }

    // If no operators, do deep equality
    return JSON.stringify(docValue) === JSON.stringify(queryValue);
  }

  /**
   * Handle query operators
   */
  static handleOperator(doc, operator, value) {
    switch (operator) {
      case '$and':
        return value.every(q => this.matchOne(doc, q));
      
      case '$or':
        return value.some(q => this.matchOne(doc, q));
      
      case '$not':
        return !this.matchOne(doc, value);
      
      default:
        return true;
    }
  }

  /**
   * Handle field-level operators
   */
  static handleFieldOperator(docValue, operator, queryValue) {
    switch (operator) {
      case '$eq':
        return docValue === queryValue;
      
      case '$ne':
        return docValue !== queryValue;
      
      case '$gt':
        return docValue > queryValue;
      
      case '$gte':
        return docValue >= queryValue;
      
      case '$lt':
        return docValue < queryValue;
      
      case '$lte':
        return docValue <= queryValue;
      
      case '$in':
        return Array.isArray(queryValue) && queryValue.includes(docValue);
      
      case '$nin':
        return Array.isArray(queryValue) && !queryValue.includes(docValue);
      
      case '$exists':
        return queryValue ? docValue !== undefined : docValue === undefined;
      
      case '$regex':
        const regex = typeof queryValue === 'string' 
          ? new RegExp(queryValue) 
          : queryValue;
        return regex.test(String(docValue));
      
      case '$contains':
        return String(docValue).includes(queryValue);
      
      case '$startsWith':
        return String(docValue).startsWith(queryValue);
      
      case '$endsWith':
        return String(docValue).endsWith(queryValue);
      
      default:
        return true;
    }
  }

  /**
   * Sort collection
   */
  static sort(collection, sortBy) {
    if (typeof sortBy === 'string') {
      return [...collection].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    if (typeof sortBy === 'object') {
      return [...collection].sort((a, b) => {
        for (const [field, order] of Object.entries(sortBy)) {
          const aVal = a[field];
          const bVal = b[field];
          const modifier = order === -1 || order === 'desc' ? -1 : 1;
          
          if (aVal > bVal) return 1 * modifier;
          if (aVal < bVal) return -1 * modifier;
        }
        return 0;
      });
    }

    return collection;
  }

  /**
   * Limit results
   */
  static limit(collection, count) {
    return collection.slice(0, count);
  }

  /**
   * Skip results
   */
  static skip(collection, count) {
    return collection.slice(count);
  }

  /**
   * Get unique values
   */
  static unique(collection, field) {
    const values = collection.map(doc => doc[field]);
    return [...new Set(values)];
  }

  /**
   * Group by field
   */
  static groupBy(collection, field) {
    return collection.reduce((groups, doc) => {
      const key = doc[field];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(doc);
      return groups;
    }, {});
  }
}