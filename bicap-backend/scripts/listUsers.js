const { connectDB } = require('../src/config/database');
const { User } = require('../src/models');
require('dotenv').config();

const listUsers = async () => {
    try {
        await connectDB();
        const users = await User.findAll();

        console.log('\n📋 DANH SÁCH USER TRONG DB:');
        console.log('------------------------------------------------');
        if (users.length === 0) {
            console.log('(Chưa có user nào)');
        } else {
            users.forEach(u => {
                console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | Name: ${u.fullName}`);
            });
        }
        console.log('------------------------------------------------\n');

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        process.exit(0);
    }
};

listUsers();
