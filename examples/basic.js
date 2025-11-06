/**
 * Basic Usage Example - Harmony
 * Classic API demonstration
 */

import { Harmony } from '../src/index.js';

async function main() {
  console.log('🎵 Harmony - Classic API Example\n');

  // Create database instance
  const db = new Harmony('test-data.json', {
    autoSave: true,
    pretty: true
  });

  // Load database
  await db.load();
  console.log('✅ Database loaded\n');

  // Insert users
  console.log('📝 Inserting users...');
  await db.insert('users', [
    { id: 1, name: 'Alice', age: 25, role: 'admin' },
    { id: 2, name: 'Bob', age: 30, role: 'user' },
    { id: 3, name: 'Charlie', age: 28, role: 'user' }
  ]);
  console.log('✅ Users inserted\n');

  // Find users
  console.log('🔍 Finding users with role "user":');
  const users = await db.find('users', { role: 'user' });
  console.log(users);
  console.log();

  // Find one user
  console.log('🔍 Finding Alice:');
  const alice = await db.findOne('users', { name: 'Alice' });
  console.log(alice);
  console.log();

  // Count users
  const count = await db.count('users');
  console.log(`📊 Total users: ${count}\n`);

  // Update user
  console.log('✏️ Updating Bob\'s age...');
  await db.update('users', { name: 'Bob' }, { age: 31 });
  const bob = await db.findOne('users', { name: 'Bob' });
  console.log('Updated Bob:', bob);
  console.log();

  // Delete user
  console.log('🗑️ Deleting Charlie...');
  await db.delete('users', { name: 'Charlie' });
  const remaining = await db.find('users');
  console.log('Remaining users:', remaining);
  console.log();

  // List collections
  console.log('📂 Collections:', db.collections());

  console.log('\n✅ Classic API example complete!');
}

main().catch(console.error);