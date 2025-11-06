/**
 * Magic Proxy API for JSONKit
 * Enables direct object-like access with auto-save
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Chain } from './chain.js';

export function magic(filePath, options = {}) {
  const config = {
    autoSave: options.autoSave ?? true,
    pretty: options.pretty ?? true,
    indent: options.indent ?? 2,
    debounce: options.debounce ?? 100, // ms delay for auto-save
    ...options
  };

  let data = {};
  let saveTimeout = null;
  let isLoaded = false;

  // Load database
  async function load() {
    if (isLoaded) return;
    
    try {
      if (existsSync(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        data = JSON.parse(content);
      } else {
        data = {};
        await save();
      }
      isLoaded = true;
    } catch (error) {
      throw new Error(`Failed to load database: ${error.message}`);
    }
  }

  // Save database with debouncing
  async function save() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    return new Promise((resolve, reject) => {
      saveTimeout = setTimeout(async () => {
        try {
          const dir = path.dirname(filePath);
          await fs.mkdir(dir, { recursive: true });

          const jsonString = config.pretty
            ? JSON.stringify(data, null, config.indent)
            : JSON.stringify(data);

          await fs.writeFile(filePath, jsonString, 'utf-8');
          resolve();
        } catch (error) {
          reject(new Error(`Failed to save database: ${error.message}`));
        }
      }, config.debounce);
    });
  }

  // Create deep proxy for nested objects
  function createProxy(target, path = []) {
    return new Proxy(target, {
      get(obj, prop) {
        // Special properties
        if (prop === '__isProxy') return true;
        if (prop === '__target') return obj;
        if (prop === '__path') return path;
        if (prop === '__save') return save;
        if (prop === '__data') return data;
        if (prop === 'then') return undefined; // Prevent promise coercion

        const value = obj[prop];

        // Return proxified objects/arrays for deep reactivity
        if (value !== null && typeof value === 'object') {
          return createProxy(value, [...path, prop]);
        }

        return value;
      },

      set(obj, prop, value) {
        obj[prop] = value;

        // Auto-save on change
        if (config.autoSave) {
          save().catch(console.error);
        }

        return true;
      },

      deleteProperty(obj, prop) {
        delete obj[prop];

        // Auto-save on delete
        if (config.autoSave) {
          save().catch(console.error);
        }

        return true;
      }
    });
  }

  // Create the main database object
  const db = {
    async load() {
      await load();
      return createProxy(data);
    },

    async save() {
      await save();
      return this;
    },

    getData() {
      return data;
    },

    collections() {
      return Object.keys(data);
    },

    async drop(collectionName) {
      delete data[collectionName];
      if (config.autoSave) {
        await save();
      }
      return this;
    },

    async clear(collectionName) {
      data[collectionName] = [];
      if (config.autoSave) {
        await save();
      }
      return this;
    },

    // Create chain query builder
    chain(collectionName) {
      return new Chain(data, collectionName, save);
    }
  };

  return db;
}