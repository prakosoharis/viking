// MongoDB Initialization Script
db = db.getSiblingDB('invoice_db');

// Create collections
db.createCollection('users');
db.createCollection('uploads');

// Create indexes
db.users.createIndex({ phone_number: 1 }, { unique: true });
db.uploads.createIndex({ user_id: 1 });
db.uploads.createIndex({ uploaded_at: -1 });

print('Database initialized successfully');
