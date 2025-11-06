/**
 * Magic API Example - Harmony
 * Demonstrates Proxy Magic API and Fluent Chain API
 */

import { magic } from '../src/index.js';

async function main() {
  console.log('🎵 Harmony - Magic API Example\n');

  // Create database with magic proxy
  const dbManager = magic('magic-data.json', {
    autoSave: true,
    pretty: true,
    debounce: 100
  });

  const db = await dbManager.load();
  console.log('✅ Database loaded with Magic Proxy\n');

  // ======================
  // MAGIC PROXY API
  // ======================
  console.log('🪄 MAGIC PROXY API\n');

  // Initialize collections
  db.users = [];
  db.posts = [];

  // Direct array operations
  console.log('📝 Adding users with array.push()...');
  db.users.push({ id: 1, name: 'Alice', age: 25, role: 'admin' });
  db.users.push({ id: 2, name: 'Bob', age: 30, role: 'user' });
  db.users.push({ id: 3, name: 'Charlie', age: 28, role: 'moderator' });
  db.users.push({ id: 4, name: 'Diana', age: 22, role: 'user' });
  console.log('✅ Users added');
  console.log('Current users:', db.users.length, 'users\n');

  // Modify nested properties
  console.log('✏️ Modifying Alice\'s age...');
  db.users[0].age = 26;
  console.log('Updated Alice:', db.users[0], '\n');

  // ======================
  // FLUENT CHAIN API
  // ======================
  console.log('🔗 FLUENT CHAIN API\n');

  // Comparison operators
  console.log('🔍 Find users age >= 25:');
  const adults = dbManager.chain('users')
    .where('age').gte(25)
    .get();
  console.log(adults);
  console.log();

  // String operators
  console.log('🔍 Find users whose name contains "li":');
  const nameMatch = dbManager.chain('users')
    .where('name').contains('li')
    .get();
  console.log(nameMatch);
  console.log();

  // Multiple conditions with chaining
  console.log('🔍 Find admin users age > 20:');
  const adminAdults = dbManager.chain('users')
    .where('role').eq('admin')
    .and('age').gt(20)
    .get();
  console.log(adminAdults);
  console.log();

  // Sorting
  console.log('📊 Users sorted by age (descending):');
  const sortedByAge = dbManager.chain('users')
    .sortDesc('age')
    .get();
  console.log(sortedByAge);
  console.log();

  // Pagination
  console.log('📄 First 2 users (pagination):');
  const firstTwo = dbManager.chain('users')
    .limit(2)
    .get();
  console.log(firstTwo);
  console.log();

  // Aggregations
  console.log('📊 AGGREGATIONS\n');
  
  const avgAge = dbManager.chain('users').avg('age');
  console.log('Average age:', avgAge);

  const minAge = dbManager.chain('users').min('age');
  console.log('Minimum age:', minAge);

  const maxAge = dbManager.chain('users').max('age');
  console.log('Maximum age:', maxAge);

  const usersByRole = dbManager.chain('users').groupBy('role');
  console.log('Users by role:', usersByRole);

  const names = dbManager.chain('users').pluck('name');
  console.log('All names:', names);
  console.log();

  // Count
  const userCount = dbManager.chain('users').where('role').eq('user').count();
  console.log(`📊 Number of regular users: ${userCount}\n`);

  // Update with chain
  console.log('✏️ Updating all regular users to verified...');
  await dbManager.chain('users')
    .where('role').eq('user')
    .update({ verified: true });
  
  const verifiedUsers = dbManager.chain('users')
    .where('verified').eq(true)
    .get();
  console.log('Verified users:', verifiedUsers);
  console.log();

  // Delete with chain
  console.log('🗑️ Deleting users under age 23...');
  await dbManager.chain('users')
    .where('age').lt(23)
    .delete();
  
  console.log('Remaining users:', db.users.length);
  console.log(db.users);
  console.log();

  // Final state
  console.log('📋 FINAL DATABASE STATE\n');
  console.log('Collections:', Object.keys(db.data));
  console.log('Total users:', db.users.length);
  console.log('All users:', db.users);

  console.log('\n✅ Magic API example complete!');
  console.log('💾 Data auto-saved to magic-data.json');
}

main().catch(console.error);