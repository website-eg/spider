require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// اتصال MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // هذه الخيارات أصبحت غير مطلوبة مع النسخ الحديثة من MongoDB Driver
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// تعريف Schema للمشرف (Admin)
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // استخدم "password" كما في قاعدة البيانات
});

const Admin = mongoose.model('Admin', AdminSchema);

// نقطة نهاية تسجيل الدخول
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم وكلمة المرور.' });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    // مقارنة كلمة المرور المدخلة مع المخزنة في قاعدة البيانات
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    // إنشاء JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'تم تسجيل الدخول بنجاح.', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في الخادم.' });
  }
});

// نقطة نهاية إنشاء حساب مشرف جديد
app.post('/api/register-admin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم وكلمة المرور.' });
  }

  try {
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'اسم المستخدم موجود مسبقاً.' });
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: passwordHash });
    await newAdmin.save();

    res.json({ message: 'تم إنشاء حساب المشرف بنجاح.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في الخادم.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
