// migrations/<timestamp>-seed-users.js

module.exports = {
    async up(db, client) {
      // Insert seed data
      const users = [
        {
          username: 'john_doe',
          lastname: 'Doe',
          email: 'john@example.com',
          avatar: 'avatar1.png',
        },
        {
          username: 'jane_doe',
          lastname: 'Doe',
          email: 'jane@example.com',
          avatar: 'avatar2.png',
        },
      ];
  
      await db.collection('users').insertMany(users);
    },
  
    async down(db, client) {
      // Rollback seed data
      await db.collection('users').deleteMany({
        username: { $in: ['john_doe', 'jane_doe'] },
      });
    },
  };
  