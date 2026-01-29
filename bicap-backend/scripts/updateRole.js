const { connectDB } = require('../src/config/database');
const { User } = require('../src/models');
require('dotenv').config();

const updateRole = async () => {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node scripts/updateRole.js <email> <role>');
        process.exit(1);
    }

    const email = args[0];
    const newRole = args[1];

    try {
        await connectDB();
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        user.role = newRole;
        await user.save();

        console.log(`✅ Updated user ${email} to role '${newRole}'`);
    } catch (error) {
        console.error('❌ Error updating role:', error);
    } finally {
        process.exit(0);
    }
};

updateRole();
