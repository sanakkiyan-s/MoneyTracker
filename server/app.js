const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Transaction = require('../models/Transaction');
const port = 3000;
require('dotenv').config();

const app = express();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error("Error: MONGODB_URI is not defined in the .env file.");
    process.exit(1);
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/transaction', async (req, res) => {
    try {
        const { type, amount, description } = req.body;
        const transaction = new Transaction({ type, amount, description });
        await transaction.save();
        res.status(201).send(transaction);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.send(transactions);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/api/transaction/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }
        res.send(transaction);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.put('/api/transaction/:id', async (req, res) => {
    try {
        const { type, amount, description } = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { type, amount, description },
            { new: true, runValidators: true }
        );
        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }
        res.send(transaction);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete('/api/transaction/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.send({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(400).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port} or http://127.0.0.1:${port}`);
  });