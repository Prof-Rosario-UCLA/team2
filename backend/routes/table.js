import express from 'express';
import { insertTable, getAllTables, getTableByNumber } from '../utils/mongodb.js';

const router = express.Router();

// Get all tables
router.get('/', async (req, res) => {
    try {
        const tables = await getAllTables();
        res.json(tables);
    } catch (error) {
        console.error('Error in GET /tables:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

// Get table by number
router.get('/:tableNumber', async (req, res) => {
    try {
        const tableNumber = parseInt(req.params.tableNumber);
        if (isNaN(tableNumber)) {
            return res.status(400).json({ error: 'Invalid table number' });
        }

        const table = await getTableByNumber(tableNumber);
        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }
        res.json(table);
    } catch (error) {
        console.error('Error in GET /tables/:tableNumber:', error);
        res.status(500).json({ error: 'Failed to fetch table' });
    }
});

// Create new table
router.post('/create', async (req, res) => {
    try {
        console.log(req);
        const { tableNumber, tableCapacity, comments } = req.body;

        // Validate required fields
        if (!tableNumber || !tableCapacity) {
            return res.status(400).json({ error: 'Table number and capacity are required' });
        }

        // Validate numeric fields
        if (isNaN(tableNumber) || isNaN(tableCapacity)) {
            return res.status(400).json({ error: 'Table number and capacity must be numbers' });
        }

        const tableData = {
            tableNumber: parseInt(tableNumber),
            tableCapacity: parseInt(tableCapacity),
            comments: comments || ''
        };

        const newTable = await insertTable(tableData);
        res.status(201).json(newTable);
    } catch (error) {
        console.error('Error in POST /tables/create:', error);
        if (error.code === 11000) {
            res.status(409).json({ error: 'Table number already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create table' });
        }
    }
});

export default router; 