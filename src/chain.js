/**
 * Fluent Chain Query Builder for JSONKit
 * SQL-like syntax for powerful queries
 */

export class Chain {
  constructor(data, collectionName, saveFn) {
    this.data = data;
    this.collectionName = collectionName;
    this.saveFn = saveFn;
    this.query = {};
    this.sortConfig = null;
    this.limitCount = null;
    this.skipCount = 0;
    this.currentField = null;
    this.conditions = [];
  }

  // Collection accessor
  get collection() {
    if (!this.data[this.collectionName]) {
      this.data[this.collectionName] = [];
    }
    return this.data[this.collectionName];
  }

  // WHERE clause
  where(field) {
    this.currentField = field;
    return this;
  }

  // SELECT clause (alias for where)
  select(field) {
    return this.where(field);
  }

  // AND clause
  and(field) {
    this.currentField = field;
    return this;
  }

  // OR clause
  or(field) {
    // For OR, we'll store conditions differently
    this.currentField = field;
    this.isOrCondition = true;
    return this;
  }

  // Comparison operators
  eq(value) {
    this.addCondition('$eq', value);
    return this;
  }

  equals(value) {
    return this.eq(value);
  }

  ne(value) {
    this.addCondition('$ne', value);
    return this;
  }

  notEquals(value) {
    return this.ne(value);
  }

  gt(value) {
    this.addCondition('$gt', value);
    return this;
  }

  greaterThan(value) {
    return this.gt(value);
  }

  gte(value) {
    this.addCondition('$gte', value);
    return this;
  }

  greaterThanOrEqual(value) {
    return this.gte(value);
  }

  lt(value) {
    this.addCondition('$lt', value);
    return this;
  }

  lessThan(value) {
    return this.lt(value);
  }

  lte(value) {
    this.addCondition('$lte', value);
    return this;
  }

  lessThanOrEqual(value) {
    return this.lte(value);
  }

  // String operators
  contains(value) {
    this.addCondition('$contains', value);
    return this;
  }

  startsWith(value) {
    this.addCondition('$startsWith', value);
    return this;
  }

  endsWith(value) {
    this.addCondition('$endsWith', value);
    return this;
  }

  matches(regex) {
    this.addCondition('$regex', regex);
    return this;
  }

  // Array operators
  in(values) {
    this.addCondition('$in', values);
    return this;
  }

  notIn(values) {
    this.addCondition('$nin', values);
    return this;
  }

  // Existence
  exists(value = true) {
    this.addCondition('$exists', value);
    return this;
  }

  // Helper to add conditions
  addCondition(operator, value) {
    if (!this.currentField) {
      throw new Error('No field specified. Use where() or and() first.');
    }

    if (!this.query[this.currentField]) {
      this.query[this.currentField] = {};
    }

    // Handle simple equality
    if (operator === '$eq') {
      this.query[this.currentField] = value;
    } else {
      if (typeof this.query[this.currentField] !== 'object') {
        this.query[this.currentField] = {};
      }
      this.query[this.currentField][operator] = value;
    }
  }

  // Sorting
  sort(field, direction = 'asc') {
    this.sortConfig = { field, direction };
    return this;
  }

  orderBy(field, direction = 'asc') {
    return this.sort(field, direction);
  }

  sortDesc(field) {
    return this.sort(field, 'desc');
  }

  sortAsc(field) {
    return this.sort(field, 'asc');
  }

  // Limit and Skip
  limit(count) {
    this.limitCount = count;
    return this;
  }

  take(count) {
    return this.limit(count);
  }

  skip(count) {
    this.skipCount = count;
    return this;
  }

  offset(count) {
    return this.skip(count);
  }

  // Execute query
  get() {
    let results = this.executeQuery();
    
    // Apply sorting
    if (this.sortConfig) {
      results = this.applySorting(results);
    }

    // Apply skip
    if (this.skipCount > 0) {
      results = results.slice(this.skipCount);
    }

    // Apply limit
    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount);
    }

    return results;
  }

  // Get first result
  first() {
    const results = this.limit(1).get();
    return results[0] || null;
  }

  // Get last result
  last() {
    const results = this.get();
    return results[results.length - 1] || null;
  }

  // Count results
  count() {
    return this.get().length;
  }

  // Check if exists
  exists() {
    return this.count() > 0;
  }

  // Execute the query
  executeQuery() {
    const collection = this.collection;

    if (Object.keys(this.query).length === 0) {
      return [...collection];
    }

    return collection.filter(doc => this.matchDocument(doc));
  }

  // Match document against query
  matchDocument(doc) {
    for (const [field, condition] of Object.entries(this.query)) {
      const docValue = doc[field];

      // Simple equality
      if (typeof condition !== 'object' || condition === null) {
        if (docValue !== condition) return false;
        continue;
      }

      // Operator-based conditions
      for (const [operator, value] of Object.entries(condition)) {
        if (!this.evaluateOperator(docValue, operator, value)) {
          return false;
        }
      }
    }

    return true;
  }

  // Evaluate operator
  evaluateOperator(docValue, operator, queryValue) {
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
        const regex = typeof queryValue === 'string' ? new RegExp(queryValue) : queryValue;
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

  // Apply sorting
  applySorting(results) {
    const { field, direction } = this.sortConfig;
    const modifier = direction === 'desc' ? -1 : 1;

    return [...results].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal > bVal) return 1 * modifier;
      if (aVal < bVal) return -1 * modifier;
      return 0;
    });
  }

  // Update methods
  async update(updates) {
    const results = this.get();
    const collection = this.collection;

    let updatedCount = 0;
    for (const doc of results) {
      const index = collection.indexOf(doc);
      if (index !== -1) {
        Object.assign(collection[index], updates);
        updatedCount++;
      }
    }

    if (this.saveFn && updatedCount > 0) {
      await this.saveFn();
    }

    return updatedCount;
  }

  async updateOne(updates) {
    const doc = this.first();
    if (!doc) return 0;

    const collection = this.collection;
    const index = collection.indexOf(doc);
    
    if (index !== -1) {
      Object.assign(collection[index], updates);
      if (this.saveFn) {
        await this.saveFn();
      }
      return 1;
    }

    return 0;
  }

  // Delete methods
  async delete() {
    const results = this.get();
    const collection = this.collection;
    const initialLength = collection.length;

    // Remove matched documents
    for (let i = collection.length - 1; i >= 0; i--) {
      if (results.includes(collection[i])) {
        collection.splice(i, 1);
      }
    }

    const deletedCount = initialLength - collection.length;

    if (this.saveFn && deletedCount > 0) {
      await this.saveFn();
    }

    return deletedCount;
  }

  async deleteOne() {
    const doc = this.first();
    if (!doc) return 0;

    const collection = this.collection;
    const index = collection.indexOf(doc);
    
    if (index !== -1) {
      collection.splice(index, 1);
      if (this.saveFn) {
        await this.saveFn();
      }
      return 1;
    }

    return 0;
  }

  // Utility methods
  pluck(field) {
    return this.get().map(doc => doc[field]);
  }

  unique(field) {
    const values = this.pluck(field);
    return [...new Set(values)];
  }

  groupBy(field) {
    return this.get().reduce((groups, doc) => {
      const key = doc[field];
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
      return groups;
    }, {});
  }

  avg(field) {
    const values = this.pluck(field).filter(v => typeof v === 'number');
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  sum(field) {
    return this.pluck(field).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0);
  }

  min(field) {
    const values = this.pluck(field).filter(v => typeof v === 'number');
    return values.length > 0 ? Math.min(...values) : null;
  }

  max(field) {
    const values = this.pluck(field).filter(v => typeof v === 'number');
    return values.length > 0 ? Math.max(...values) : null;
  }
}