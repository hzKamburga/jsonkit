/**
 * Basic usage example for JSONKit
 */

import { JSONKit } from '../src/index.js';

async function main() {
  // Create database instance
  const db = new JSONKit('mydata.json', {
    autoSave: true,
    pretty: true
  });

  // Load database
  await db.load();

  console.log('📦 JSONKit Example\n');

  // Insert data
  console.log('➕ Inserting users...');
  await db.insert('users', {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    age: 25
  });

  await db.insert('users', {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    age: 30
  });

  await db.insert('users', {
    id: 3,
    name: 'Charlie',
    email: 'charlie@example.com',
    age: 28
  });

  // Find all users
  console.log('\n🔍 Finding all users:');
  const allUsers = await db.find('users');
  console.log(allUsers);

  // Find specific user
  console.log('\n🔍 Finding user with name "Bob":');
  const bob = await db.findOne('users', { name: 'Bob' });
  console.log(bob);

  // Find with query operators
  console.log('\n🔍 Finding users older than 26:');
  const olderUsers = await db.find('users', { age: { $gt: 26 } });
  console.log(olderUsers);

  // Update user
  console.log('\n✏️ Updating Bob\'s age:');
  await db.update('users', { name: 'Bob' }, { age: 31 });
  const updatedBob = await db.findOne('users', { name: 'Bob' });
  console.log(updatedBob);

  // Count users
  console.log('\n📊 Total users:');
  const count = await db.count('users');
  console.log(count);

  // Delete user
  console.log('\n🗑️ Deleting Charlie:');
  await db.delete('users', { name: 'Charlie' });
  const remainingUsers = await db.find('users');
  console.log('Remaining users:', remainingUsers.length);

  console.log('\n✅ Example completed! Check mydata.json file.');
}

main().catch(console.error);