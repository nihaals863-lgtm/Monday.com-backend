const express = require('express');
const router = express.Router();
const { Payroll } = require('../models');

// GET all payroll records
router.get('/', async (req, res) => {
    try {
        const records = await Payroll.findAll({
            order: [['createdAt', 'DESC']]
        });

        // Add calculated fields on the fly
        const enrichedRecords = records.map(record => {
            const data = record.toJSON();
            const presentDays = parseFloat(data.presentDays || 0);
            const overtimeHours = parseFloat(data.overtimeHours || 0);
            const totalWorkedHours = (presentDays * 8) + overtimeHours;

            const perDaySalary = data.totalWorkingDays > 0 ? (data.basicSalary / data.totalWorkingDays) : 0;
            const leaveDeduction = data.leaveDays * perDaySalary;
            const overtimePay = data.overtimeHours * data.overtimeRate;
            const totalBonus = parseFloat(data.performanceBonus || 0) + parseFloat(data.festivalBonus || 0) + parseFloat(data.bonus || 0);
            const grossSalary = parseFloat(data.basicSalary) + parseFloat(overtimePay) + totalBonus;
            const netPayable = grossSalary - leaveDeduction;
            const taxDeduction = netPayable * (data.tdsPercent / 100);
            const finalSalary = netPayable - taxDeduction;

            return {
                ...data,
                totalWorkedHours: totalWorkedHours.toFixed(1),
                perDaySalary: perDaySalary.toFixed(2),
                leaveDeduction: leaveDeduction.toFixed(2),
                overtimePay: overtimePay.toFixed(2),
                grossSalary: grossSalary.toFixed(2),
                taxDeduction: taxDeduction.toFixed(2),
                netPayable: finalSalary.toFixed(2)
            };
        });

        res.json(enrichedRecords);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new payroll entry
router.post('/', async (req, res) => {
    try {
        const record = await Payroll.create(req.body);
        res.status(201).json(record);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH update payroll entry
router.patch('/:id', async (req, res) => {
    try {
        const record = await Payroll.findByPk(req.params.id);
        if (!record) return res.status(404).json({ error: 'Record not found' });

        await record.update(req.body);
        res.json(record);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE payroll entry
router.delete('/:id', async (req, res) => {
    try {
        const record = await Payroll.findByPk(req.params.id);
        if (!record) return res.status(404).json({ error: 'Record not found' });

        await record.destroy();
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
