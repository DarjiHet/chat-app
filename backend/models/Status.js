const mongoose = require('mongoose')

const statusSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: { type: String, required: true },
    contentType: { type: String, email: ['image', 'video', 'text'], default:'text' },
    viewers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    expiryAt: {type: Date, required: true},
},{timestamps: true})

const Status = mongoose.model('Status', statusSchema)

module.exports = Status;