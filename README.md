# 🎵 Harmony

**A harmonious JSON database with Magic Proxy & Fluent Chain API** - Better than LowDB

## ✨ Features

- 🪄 **Magic Proxy API** - Object-like database access with ES6 Proxies
- 🔗 **Fluent Chain API** - SQL-like queries with method chaining
- 🔥 **Blazing Fast** - Optimized read/write operations
- 📦 **Lightweight** - Zero dependencies
- 💾 **Auto-save** - Automatic data persistence with debouncing
- ⚡ **ES Modules** - Modern JavaScript syntax
- 🎯 **Simple & Powerful** - Two APIs in one package

## 📦 Installation

```bash
npm install harmony
```

## 🚀 Quick Start

### Magic Proxy API (Recommended)

```javascript
import { magic } from 'harmony';

// Create database with magic proxy
const dbManager = magic('data.json');
const db = await dbManager.load();

// Use like a regular JavaScript object!
db.users = [];
db.users.push({ id: 1, name: 'Alice', age: 25 });
db.users.push({ id: 2, name: 'Bob', age: 30 });

// Data is auto-saved! ✨
```

### Fluent Chain API

```javascript
import { magic } from 'harmony';

const dbManager = magic('data.json');
await dbManager.load();

// SQL-like fluent queries
const adults = dbManager.chain('users')
  .where('age').gte(18)
  .sort('name', 'asc')
  .get();

// Update with chain
await dbManager.chain('users')
  .where('name').eq('Bob')
  .update({ age: 31 });

// Delete with chain
await dbManager.chain('users')
  .where('age').lt(18)
  .delete();
```

### Classic API

```javascript
import { Harmony } from 'harmony';

const db = new Harmony('data.json');
await db.load();

// Insert
await db.insert('users', { id: 1, name: 'Alice' });

// Find
const users = await db.find('users', { name: 'Alice' });

// Update
await db.update('users', { id: 1 }, { age: 26 });

// Delete
await db.delete('users', { id: 1 });
```

## 📚 API Documentation

### Magic Proxy API

#### Creating a Database

```javascript
import { magic } from 'harmony';

const dbManager = magic('data.json', {
  autoSave: true,    // Auto-save on changes (default: true)
  pretty: true,      // Pretty print JSON (default: true)
  indent: 2,         // Indentation spaces (default: 2)
  debounce: 100      // Auto-save delay in ms (default: 100)
});

const db = await dbManager.load();
```

#### Direct Object Access

```javascript
// Initialize collections
db.users = [];
db.posts = [];

// Array operations work directly
db.users.push({ id: 1, name: 'Alice' });
db.users[0].age = 25;  // Modify nested properties

// Object operations
db.settings = { theme: 'dark', lang: 'en' };
db.settings.theme = 'light';

// Delete
delete db.users[0];
```

### Fluent Chain API

#### Comparison Operators

```javascript
dbManager.chain('users').where('age').eq(25)      // Equal
dbManager.chain('users').where('age').ne(25)      // Not equal
dbManager.chain('users').where('age').gt(25)      // Greater than
dbManager.chain('users').where('age').gte(25)     // Greater than or equal
dbManager.chain('users').where('age').lt(25)      // Less than
dbManager.chain('users').where('age').lte(25)     // Less than or equal
```

#### String Operators

```javascript
dbManager.chain('users').where('name').contains('Ali')
dbManager.chain('users').where('name').startsWith('A')
dbManager.chain('users').where('name').endsWith('e')
dbManager.chain('users').where('name').matches(/^[A-Z]/)
```

#### Array Operators

```javascript
dbManager.chain('users').where('role').in(['admin', 'mod'])
dbManager.chain('users').where('status').notIn(['banned', 'deleted'])
```

#### Chaining Conditions

```javascript
dbManager.chain('users')
  .where('age').gte(18)
  .and('role').eq('admin')
  .get();
```

#### Sorting

```javascript
dbManager.chain('users').sort('age', 'asc')
dbManager.chain('users').sort('age', 'desc')
dbManager.chain('users').orderBy('name')
dbManager.chain('users').sortAsc('age')
dbManager.chain('users').sortDesc('age')
```

#### Pagination

```javascript
dbManager.chain('users').limit(10)
dbManager.chain('users').skip(20).limit(10)
dbManager.chain('users').take(5)
dbManager.chain('users').offset(10).take(5)
```

#### Retrieval Methods

```javascript
dbManager.chain('users').get()           // Get all matching
dbManager.chain('users').first()         // Get first match
dbManager.chain('users').last()          // Get last match
dbManager.chain('users').count()         // Count matches
dbManager.chain('users').exists()        // Check if exists
```

#### Updates & Deletes

```javascript
// Update matching documents
await dbManager.chain('users')
  .where('role').eq('user')
  .update({ verified: true });

// Update one document
await dbManager.chain('users')
  .where('id').eq(1)
  .updateOne({ age: 26 });

// Delete matching documents
await dbManager.chain('users')
  .where('active').eq(false)
  .delete();

// Delete one document
await dbManager.chain('users')
  .where('id').eq(1)
  .deleteOne();
```

#### Aggregations

```javascript
dbManager.chain('products').avg('price')
dbManager.chain('products').sum('quantity')
dbManager.chain('products').min('price')
dbManager.chain('products').max('price')
dbManager.chain('users').groupBy('role')
dbManager.chain('users').pluck('name')
dbManager.chain('users').unique('country')
```

### Classic API Methods

```javascript
const db = new Harmony('data.json', options);

await db.load()                          // Load database
await db.save()                          // Save database
await db.insert(collection, data)        // Insert document(s)
await db.find(collection, query)         // Find documents
await db.findOne(collection, query)      // Find one document
await db.update(collection, query, data) // Update documents
await db.updateOne(collection, query, data) // Update one document
await db.delete(collection, query)       // Delete documents
await db.deleteOne(collection, query)    // Delete one document
await db.count(collection, query)        // Count documents
await db.clear(collection)               // Clear collection
await db.drop(collection)                // Drop collection
db.collections()                         // List collections
db.getData()                             // Get raw data
db.setData(data)                         // Set raw data
```

## 🔥 Why Harmony > LowDB?

| Feature | Harmony | LowDB |
|---------|---------|-------|
| Magic Proxy API | ✅ | ❌ |
| Fluent Chain Queries | ✅ | ❌ |
| Auto-save with Debounce | ✅ | Limited |
| Complex Queries | ✅ | ❌ |
| Aggregations | ✅ | ❌ |
| TypeScript Support | ✅ | Partial |
| Zero Dependencies | ✅ | ❌ |
| Performance | ⚡ Faster | ✓ |

## 💡 Examples

### Blog System

```javascript
import { magic } from 'harmony';

const dbManager = magic('blog.json');
const db = await dbManager.load();

// Initialize
db.posts = [];
db.comments = [];

// Add post
db.posts.push({
  id: 1,
  title: 'Hello World',
  content: 'First post!',
  author: 'Alice',
  createdAt: new Date()
});

// Find recent posts
const recent = dbManager.chain('posts')
  .sort('createdAt', 'desc')
  .limit(5)
  .get();

// Get posts by author
const alicePosts = dbManager.chain('posts')
  .where('author').eq('Alice')
  .get();
```

### User Management

```javascript
import { magic } from 'harmony';

const dbManager = magic('users.json');
const db = await dbManager.load();

db.users = [];

// Register users
db.users.push({ id: 1, name: 'Alice', role: 'admin', active: true });
db.users.push({ id: 2, name: 'Bob', role: 'user', active: false });

// Find active admins
const admins = dbManager.chain('users')
  .where('role').eq('admin')
  .and('active').eq(true)
  .get();

// Deactivate user
await dbManager.chain('users')
  .where('id').eq(2)
  .update({ active: false });

// Stats
const usersByRole = dbManager.chain('users').groupBy('role');
const totalActive = dbManager.chain('users').where('active').eq(true).count();
```

## 📄 License

MIT © 2024

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## 💬 Support

If you like Harmony, please give it a ⭐ on GitHub!