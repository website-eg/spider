// createAdmin.js
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = new Admin({
    username: 'spider',  // غيرها لأي اسم تريده
    password: 'spider',  // غيرها لكلمة مرور قوية
  });
  await admin.save();
  console.log('Admin created!');
  process.exit();
}

createAdmin().catch(console.error);
