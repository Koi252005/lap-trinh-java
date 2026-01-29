const express = require('express');
const router = express.Router();
const taskController = require('../controllers/seasonTaskController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken, requireRole(['farm', 'admin']));

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id/toggle', taskController.toggleComplete);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
