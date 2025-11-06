# 🚀 JSONKit

A fast, easy-to-use, and powerful JSON database for Node.js - **Better than LowDB**

## ✨ Features

- 🔥 **Blazing Fast** - Optimized read/write operations
- 🎯 **Simple API** - Intuitive and easy to use
- 📦 **Lightweight** - Zero dependencies
- 🔍 **Query Builder** - SQL-like queries for JSON
- 💾 **Auto-save** - Automatic data persistence
- 🔒 **Type Safe** - Full TypeScript support
- ⚡ **ES Modules** - Modern JavaScript syntax
- 🎨 **Chain Methods** - Fluent API design

## 📦 Installation

```bash
npm install jsonkit
```

## 🎯 Quick Start

```javascript
import { JSONKit } from 'jsonkit';

// Create or connect to a database
const db = new JSONKit('database.json');

// Insert data
await db.insert('users', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
});

// Query data
const users = await db.find('users', { name: 'John Doe' });

// Update data
await db.update('users', { id: 1 }, { email: 'newemail@example.com' });

// Delete data
await db.delete('users', { id: 1 });
```

## 📚 API Documentation

### Creating a Database

```javascript
const db = new JSONKit('database.json', {
  autoSave: true,        // Auto-save on changes (default: true)
  pretty: true,          // Pretty print JSON (default: true)
  backup: false          // Create backups (default: false)
});
```

### Methods

- `insert(collection, data)` - Insert document(s)
- `find(collection, query)` - Find documents
- `findOne(collection, query)` - Find single document
- `update(collection, query, data)` - Update documents
- `delete(collection, query)` - Delete documents
- `count(collection, query)` - Count documents
- `save()` - Manually save database

## 🔥 Why JSONKit > LowDB?

| Feature | JSONKit | LowDB |
|---------|---------|-------|
| Performance | ⚡ Faster | ✓ |
| Query Builder | ✓ | ✗ |
| Auto-save | ✓ | Limited |
| TypeScript | ✓ Full | Partial |
| API Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 📄 License

MIT © 2024

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## 📮 Contact

GitHub: 