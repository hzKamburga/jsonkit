/**
 * Harmony - A harmonious JSON database
 * Unique API with innovative method names
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export class Harmony {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.data = {};
    this.config = {
      autoSave: options.autoSave ?? true,
      pretty: options.pretty ?? true,
      indent: options.indent ?? 2,
      debounce: options.debounce ?? 100,
      autoIndex: options.autoIndex ?? true,
      ...options
    };
    
    this._metadata = {
      version: '1.0.0',
      created: new Date().toISOString(),
      tables: [],
      schemas: {},
      indexes: {},
      relations: {}
    };

    this._saveTimeout = null;
    this._queryContext = null;
  }

  // ==================== LIFECYCLE ====================

  async load() {
    try {
      if (existsSync(this.filePath)) {
        const content = await fs.readFile(this.filePath, 'utf-8');
        const parsed = JSON.parse(content);
        
        if (parsed._meta) {
          this._metadata = parsed._meta;
          delete parsed._meta;
        }
        
        this.data = parsed;
      } else {
        this.data = {};
        await this.save();
      }
      return this;
    } catch (error) {
      throw new Error(`Failed to load database: ${error.message}`);
    }
  }

  async save() {
    try {
      if (this._saveTimeout) {
        clearTimeout(this._saveTimeout);
      }

      const saveNow = async () => {
        const dir = path.dirname(this.filePath);
        await fs.mkdir(dir, { recursive: true });

        const output = {
          _meta: this._metadata,
          ...this.data
        };

        const jsonString = this.config.pretty
          ? JSON.stringify(output, null, this.config.indent)
          : JSON.stringify(output);

        await fs.writeFile(this.filePath, jsonString, 'utf-8');
      };

      if (this.config.debounce > 0) {
        this._saveTimeout = setTimeout(saveNow, this.config.debounce);
      } else {
        await saveNow();
      }

      return this;
    } catch (error) {
      throw new Error(`Failed to save database: ${error.message}`);
    }
  }

  // ==================== DATA RETRIEVAL ====================

  grab(table) {
    const data = this.data[table] || [];
    return {
      all: () => data,
      first: () => data[0] || null,
      last: () => data[data.length - 1] || null,
      random: () => {
        return data[Math.floor(Math.random() * data.length)] || null;
      },
      at: (index) => data[index] || null,
      slice: (start, end) => data.slice(start, end),
      limit: (n) => data.slice(0, n),
      skip: (n) => data.slice(n)
    };
  }

  fetch(table) {
    const data = this.data[table] || [];
    
    const chainable = {
      _data: [...data],
      _filters: [],
      
      where(field, operator, value) {
        if (arguments.length === 2) {
          value = operator;
          operator = '===';
        }
        
        this._filters.push({ field, operator, value });
        return this;
      },

      match(query) {
        this._data = this._data.filter(item => {
          return Object.entries(query).every(([key, val]) => item[key] === val);
        });
        return this;
      },

      contains(field, searchTerm) {
        this._data = this._data.filter(item => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.includes(searchTerm);
          }
          if (Array.isArray(value)) {
            return value.includes(searchTerm);
          }
          return false;
        });
        return this;
      },

      between(field, min, max) {
        this._data = this._data.filter(item => {
          const value = item[field];
          return value >= min && value <= max;
        });
        return this;
      },

      sort(field, direction = 'asc') {
        this._data = [...this._data].sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return direction === 'asc' ? comparison : -comparison;
        });
        return this;
      },

      limit(n) {
        this._data = this._data.slice(0, n);
        return this;
      },

      skip(n) {
        this._data = this._data.slice(n);
        return this;
      },

      get() {
        let result = this._data;
        
        this._filters.forEach(({ field, operator, value }) => {
          result = result.filter(item => {
            const itemValue = item[field];
            switch (operator) {
              case '===': return itemValue === value;
              case '!==': return itemValue !== value;
              case '>': return itemValue > value;
              case '>=': return itemValue >= value;
              case '<': return itemValue < value;
              case '<=': return itemValue <= value;
              default: return true;
            }
          });
        });
        
        return result;
      },

      first() {
        return this.get()[0] || null;
      },

      count() {
        return this.get().length;
      },

      exists() {
        return this.get().length > 0;
      }
    };

    return chainable;
  }

  // ==================== DATA EXTRACTION ====================

  pluck(table, field) {
    const data = this.data[table] || [];
    return data.map(item => item[field]).filter(val => val !== undefined);
  }

  harvest(table, fields) {
    const data = this.data[table] || [];
    return data.map(item => {
      const result = {};
      fields.forEach(field => {
        if (item[field] !== undefined) {
          result[field] = item[field];
        }
      });
      return result;
    });
  }

  unique(table, field) {
    const values = this.pluck(table, field);
    return [...new Set(values)];
  }

  // ==================== DATA INSERTION ====================

  async insert(table, records) {
    if (!this.data[table]) {
      this.data[table] = [];
    }

    const items = Array.isArray(records) ? records : [records];
    this.data[table].push(...items);
    
    this._detectSchema(table);

    if (this.config.autoSave) {
      await this.save();
    }

    return items;
  }

  async append(table, record) {
    return this.insert(table, record);
  }

  async push(table, record) {
    return this.insert(table, record);
  }

  // ==================== DATA MODIFICATION ====================

  async morph(table, transformer) {
    if (!this.data[table]) return 0;

    this.data[table] = this.data[table].map(transformer);

    if (this.config.autoSave) {
      await this.save();
    }

    return this.data[table].length;
  }

  async transform(table, field, transformer) {
    if (!this.data[table]) return 0;

    this.data[table].forEach(item => {
      if (item[field] !== undefined) {
        item[field] = transformer(item[field], item);
      }
    });

    if (this.config.autoSave) {
      await this.save();
    }

    return this.data[table].length;
  }

  async update(table, query, updates) {
    if (!this.data[table]) return 0;

    let updated = 0;
    this.data[table].forEach(item => {
      const matches = Object.entries(query).every(([key, val]) => item[key] === val);
      if (matches) {
        Object.assign(item, updates);
        updated++;
      }
    });

    if (updated > 0 && this.config.autoSave) {
      await this.save();
    }

    return updated;
  }

  async patch(table, id, updates) {
    return this.update(table, { id }, updates);
  }

  // ==================== DATA DELETION ====================

  async remove(table, query) {
    if (!this.data[table]) return 0;

    const before = this.data[table].length;
    
    this.data[table] = this.data[table].filter(item => {
      return !Object.entries(query).every(([key, val]) => item[key] === val);
    });

    const removed = before - this.data[table].length;

    if (removed > 0 && this.config.autoSave) {
      await this.save();
    }

    return removed;
  }

  async purge(table, condition) {
    if (!this.data[table]) return 0;

    const before = this.data[table].length;
    this.data[table] = this.data[table].filter(item => !condition(item));
    const removed = before - this.data[table].length;

    if (removed > 0 && this.config.autoSave) {
      await this.save();
    }

    return removed;
  }

  async clear(table) {
    if (!this.data[table]) return 0;

    const count = this.data[table].length;
    this.data[table] = [];

    if (this.config.autoSave) {
      await this.save();
    }

    return count;
  }

  async drop(table) {
    if (!this.data[table]) return false;

    delete this.data[table];
    this._metadata.tables = this._metadata.tables.filter(t => t !== table);

    if (this.config.autoSave) {
      await this.save();
    }

    return true;
  }

  // ==================== AGGREGATIONS ====================

  count(table, query = null) {
    if (!this.data[table]) return 0;
    
    if (query) {
      return this.fetch(table).match(query).count();
    }
    
    return this.data[table].length;
  }

  sum(table, field) {
    const data = this.data[table] || [];
    return data.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
  }

  avg(table, field) {
    const data = this.data[table] || [];
    if (data.length === 0) return 0;
    return this.sum(table, field) / data.length;
  }

  min(table, field) {
    const values = this.pluck(table, field).filter(v => typeof v === 'number');
    return values.length > 0 ? Math.min(...values) : null;
  }

  max(table, field) {
    const values = this.pluck(table, field).filter(v => typeof v === 'number');
    return values.length > 0 ? Math.max(...values) : null;
  }

  group(table, field) {
    const data = this.data[table] || [];
    const grouped = {};
    
    data.forEach(item => {
      const key = item[field];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return grouped;
  }

  cluster(table, field, ranges) {
    const data = this.data[table] || [];
    const clusters = {};
    
    for (let i = 0; i < ranges.length - 1; i++) {
      const label = `${ranges[i]}-${ranges[i + 1]}`;
      clusters[label] = [];
    }
    
    data.forEach(item => {
      const value = item[field];
      for (let i = 0; i < ranges.length - 1; i++) {
        if (value >= ranges[i] && value < ranges[i + 1]) {
          const label = `${ranges[i]}-${ranges[i + 1]}`;
          clusters[label].push(item);
          break;
        }
      }
    });
    
    return clusters;
  }

  // ==================== RELATIONS ====================

  link(table1, table2, foreignKey, primaryKey = 'id') {
    this._metadata.relations[`${table1}_${table2}`] = {
      from: `${table1}.${foreignKey}`,
      to: `${table2}.${primaryKey}`
    };
    return this;
  }

  merge(table1, table2, foreignKey, primaryKey = 'id') {
    const data1 = this.data[table1] || [];
    const data2 = this.data[table2] || [];
    
    const lookup = {};
    data2.forEach(item => {
      lookup[item[primaryKey]] = item;
    });
    
    return data1.map(item => {
      const related = lookup[item[foreignKey]];
      return related ? { ...item, ...related } : item;
    });
  }

  nest(table, childTable, foreignKey) {
    const parents = this.data[table] || [];
    const children = this.data[childTable] || [];
    
    return parents.map(parent => {
      const nested = children.filter(child => child[foreignKey] === parent.id);
      return { ...parent, [childTable]: nested };
    });
  }

  // ==================== SEARCH ====================

  search(table, field, term) {
    const data = this.data[table] || [];
    const lowerTerm = String(term).toLowerCase();
    
    return data.filter(item => {
      const value = String(item[field] || '').toLowerCase();
      return value.includes(lowerTerm);
    });
  }

  scan(table, field, pattern) {
    const data = this.data[table] || [];
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    
    return data.filter(item => {
      const value = String(item[field] || '');
      return regex.test(value);
    });
  }

  // ==================== UTILITIES ====================

  tables() {
    return Object.keys(this.data).filter(key => !key.startsWith('_'));
  }

  schema(table) {
    return this._metadata.schemas[table] || null;
  }

  snapshot() {
    return JSON.parse(JSON.stringify({ ...this.data, _meta: this._metadata }));
  }

  restore(snapshot) {
    if (snapshot._meta) {
      this._metadata = snapshot._meta;
      delete snapshot._meta;
    }
    this.data = snapshot;
    return this;
  }

  _detectSchema(table) {
    if (!this.data[table] || this.data[table].length === 0) return;

    const sample = this.data[table][0];
    const schema = {};
    
    Object.entries(sample).forEach(([key, value]) => {
      schema[key] = typeof value;
    });
    
    this._metadata.schemas[table] = schema;
  }
}