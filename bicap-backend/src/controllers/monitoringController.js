// src/controllers/monitoringController.js

// Mock Data Generator
// Realistic Data Generator based on time of day
const generateRealisticData = (date = new Date()) => {
    const hours = date.getHours() + date.getMinutes() / 60;

    // Temperature: Sine wave cycle
    // Peak at 14:00 (2pm), Lowest at 02:00 (2am)
    // Formula: Avg + Amp * sin((hours - shift) * frequency)
    // Shift: to align peak at 14h. sin is max at PI/2. 
    // (14 - shift) * (2PI / 24) = PI/2 => shift = 8
    const tempBase = 28; // Average temp
    const tempAmp = 5;   // Fluctuation +/- 5 degrees
    const tempNoise = (Math.random() - 0.5) * 0.5; // Small random noise
    const temperature = tempBase + tempAmp * Math.sin((hours - 8) * (Math.PI / 12)) + tempNoise;

    // Humidity: Inversely related to temperature
    // Higher temp -> Lower humidity usually
    // Humidity peaks at night (cool), low at day (hot)
    const humidityBase = 75;
    const humidityAmp = 15;
    const humidityNoise = (Math.random() - 0.5) * 2;
    // Inverse phase to temp
    const humidity = humidityBase - humidityAmp * Math.sin((hours - 8) * (Math.PI / 12)) + humidityNoise;

    // pH: Stable with very minor fluctuations
    const phBase = 6.5;
    const phNoise = (Math.random() - 0.5) * 0.2;
    const ph = phBase + phNoise;

    return {
        temperature: parseFloat(temperature.toFixed(1)),
        humidity: parseFloat(humidity.toFixed(1)),
        ph: parseFloat(ph.toFixed(1)),
        timestamp: date
    };
};

const { Farm, Notification } = require('../models');
const { createNotificationInternal } = require('./notificationController');
const { Op } = require('sequelize');

exports.getCurrentEnvironment = async (req, res) => {
    try {
        const { farmId } = req.params;
        // Generate data for current moment
        const data = generateRealisticData(new Date());

        // --- ALERT LOGIC ---
        // Fetch farm owner
        const farm = await Farm.findByPk(farmId);
        if (farm && farm.ownerId) {
            const alerts = [];
            if (data.temperature > 38) alerts.push({ type: 'temperature', msg: `Nhiệt độ cao bất thường: ${data.temperature}°C` });
            if (data.ph < 4 || data.ph > 9) alerts.push({ type: 'ph', msg: `Độ pH không ổn định: ${data.ph}` });

            for (const alert of alerts) {
                // Check throttling: Has an alert of this type been sent in the last hour?
                const lastAlert = await Notification.findOne({
                    where: {
                        userId: farm.ownerId,
                        title: { [Op.like]: `%${alert.type === 'temperature' ? 'Nhiệt độ' : 'pH'}%` },
                        createdAt: { [Op.gt]: new Date(Date.now() - 60 * 60 * 1000) }
                    }
                });

                if (!lastAlert) {
                    await createNotificationInternal(
                        farm.ownerId,
                        'Cảnh báo Môi trường',
                        alert.msg,
                        'system'
                    );
                    console.log(`[IoT Alert] Sent to User ${farm.ownerId}: ${alert.msg}`);
                }
            }
        }
        // --- END ALERT LOGIC ---

        res.json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu môi trường' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { farmId } = req.params;
        // Generate history for last 24h
        const history = [];
        const now = new Date();
        const nowMs = now.getTime();

        for (let i = 24; i >= 0; i--) {
            const time = new Date(nowMs - i * 60 * 60 * 1000); // go back i hours
            const point = generateRealisticData(time);
            history.push(point);
        }
        res.json({ history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy lịch sử môi trường' });
    }
};
