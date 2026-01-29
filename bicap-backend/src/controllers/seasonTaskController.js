const { SeasonTask, FarmingSeason } = require('../models');

// 1. Get Tasks
exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { seasonId } = req.query;

        const whereClause = { userId };
        if (seasonId) whereClause.seasonId = seasonId;

        const tasks = await SeasonTask.findAll({
            where: whereClause,
            include: [{
                model: FarmingSeason,
                as: 'season',
                attributes: ['name']
            }],
            order: [
                ['isCompleted', 'ASC'],
                ['createdAt', 'DESC']
            ]
        });
        res.json({ tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Create Task
exports.createTask = async (req, res) => {
    try {
        const { title, farmId, seasonId, priority } = req.body;
        const userId = req.user.id;

        if (!seasonId) return res.status(400).json({ message: 'Vui lòng chọn vụ mùa' });

        const newTask = await SeasonTask.create({
            title,
            userId,
            farmId,
            seasonId,
            priority: priority || 'normal',
            isCompleted: false
        });

        res.status(201).json({ task: newTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi tạo công việc' });
    }
};

// 3. Toggle Complete
exports.toggleComplete = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const task = await SeasonTask.findOne({ where: { id, userId } });
        if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });

        task.isCompleted = !task.isCompleted;
        await task.save();

        res.json({ task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật' });
    }
};

// 4. Delete Task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await SeasonTask.destroy({ where: { id, userId } });
        if (!result) return res.status(404).json({ message: 'Không tìm thấy công việc' });

        res.json({ message: 'Đã xóa công việc' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi xóa' });
    }
};
