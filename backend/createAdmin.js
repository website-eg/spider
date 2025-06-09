require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// اتصال MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // خيارات الاتصال حسب الحاجة
}).then(() => {
  console.log('MongoDB connected');
  updateUser();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model('Admin', AdminSchema);

async function updateUser() {
  try {
    const oldUsername = 'spider';   // اسم المستخدم القديم اللي عايز تغيّره
    const newUsername = 'spidergym';  // الاسم الجديد
    const newPasswordPlain = 'spidergym'; // كلمة المرور الجديدة (نص عادي)

    // تشفير كلمة المرور الجديدة
    const newPasswordHash = await bcrypt.hash(newPasswordPlain, 10);

    // تحديث المستخدم
    const result = await Admin.findOneAndUpdate(
      { username: oldUsername },
      { username: newUsername, password: newPasswordHash },
      { new: true }
    );

    if (result) {
      console.log('User updated successfully:', result);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error updating user:', err);
  } finally {
    mongoose.connection.close();
  }
}