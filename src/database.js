/**
 * JSONKit Database Class
 * Main database functionality for JSONKit
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Query } from './query.js';

export class JSONKit {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.options = {
      autoSave: options.autoSave ?? true,
      pretty: options.pretty ?? true,
      backup: options.backup ?? false,
      indent: options.indent ?? 2,
      ...options
    };
    
    this.data = {};
    this.loaded = false;
  }

  /**
   * Initialize and load the database
   */
  async load() {
    if (this.loaded) return this;

    try {
      if (existsSync(this.filePath)) {
        const fileContent = await fs.readFile(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = {};
        await this.save();
      }
      this.loaded = true;
    } catch (error) {
      throw new Error(`Failed to load database: ${error.message}`);
    }

    return this;
  }

  /**
   * Save database to file
   */
  async save() {
    try {
      // Create backup if enabled
      if (this.options.backup && existsSync(this.filePath)) {
        const backupPath = `${this.filePath}.backup`;
        await fs.copyFile(this.filePath, backupPath);
      }

      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      // Write data
      const jsonString = this.options.pretty
        ? JSON.stringify(this.data, null, this.options.indent)
        : JSON.stringify(this.data);

      await fs.writeFile(this.filePath, jsonString, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save database: ${error.message}`);
    }

    return this;
  }

  /**
   * Get or create a collection
   */
  collection(name) {
    if (!this.loaded) {
      throw new Error('Database not loaded. Call await db.load() first.');
    }

    if (!this.data[name]) {
      this.data[name] = [];
    }

    return this.data[name];
  }

  /**
   * Insert document(s) into a collection
   */
  async insert(collectionName, document) {
    const collection = this.collection(collectionName);
    
    if (Array.isArray(document)) {
      collection.push(...document);
    } else {
      collection.push(document);
    }

    if (this.options.autoSave) {
      await this.save();
    }

    return document;
  }

  /**
   * Find documents in a collection
   */
  async find(collectionName, query = {}) {
    const collection = this.collection(collectionName);
    
    if (Object.keys(query).length === 0) {
      return collection;
    }

    return Query.match(collection, query);
  }

  /**
   * Find one document in a collection
   */
  async findOne(collectionName, query = {}) {
    const results = await this.find(collectionName, query);
    return results[0] || null;
  }

  /**
   * Update documents in a collection
   */
  async update(collectionName, query, updates) {
    const collection = this.collection(collectionName);
    let updatedCount = 0;

    for (let i = 0; i < collection.length; i++) {
      if (Query.matchOne(collection[i], query)) {
        Object.assign(collection[i], updates);
        updatedCount++;
      }
    }

    if (this.options.autoSave && updatedCount > 0) {
      await this.save();
    }

    return updatedCount;
  }

  /**
   * Update one document in a collection
   */
  async updateOne(collectionName, query, updates) {
    const collection = this.collection(collectionName);

    for (let i = 0; i < collection.length; i++) {
      if (Query.matchOne(collection[i], query)) {
        Object.assign(collection[i], updates);
        
        if (this.options.autoSave) {
          await this.save();
        }
        
        return 1;
      }
    }

    return 0;
  }

  /**
   * Delete documents from a collection
   */
  async delete(collectionName, query) {
    const collection = this.collection(collectionName);
    const initialLength = collection.length;

    this.data[collectionName] = collection.filter(
      doc => !Query.matchOne(doc, query)
    );

    const deletedCount = initialLength - this.data[collectionName].length;

    if (this.options.autoSave && deletedCount > 0) {
      await this.save();
    }

    return deletedCount;
  }

  /**
   * Delete one document from a collection
   */
  async deleteOne(collectionName, query) {
    const collection = this.collection(collectionName);

    for (let i = 0; i < collection.length; i++) {
      if (Query.matchOne(collection[i], query)) {
        collection.splice(i, 1);
        
        if (this.options.autoSave) {
          await this.save();
        }
        
        return 1;
      }
    }

    return 0;
  }

  /**
   * Count documents in a collection
   */
  async count(collectionName, query = {}) {
    const results = await this.find(collectionName, query);
    return results.length;
  }

  /**
   * Clear a collection
   */
  async clear(collectionName) {
    this.data[collectionName] = [];

    if (this.options.autoSave) {
      await this.save();
    }

    return this;
  }

  /**
   * Drop a collection
   */
  async drop(collectionName) {
    delete this.data[collectionName];

    if (this.options.autoSave) {
      await this.save();
    }

    return this;
  }

  /**
   * Get all collection names
   */
  collections() {
    return Object.keys(this.data);
  }

  /**
   * Get raw data
   */
  getData() {
    return this.data;
  }

  /**
   * Set raw data
   */
  setData(data) {
    this.data = data;
    return this;
  }
}