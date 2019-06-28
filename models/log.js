const { Schema, model } = require('mongoose');
const { v4: uuid } = require('uuid');

const logSchema = new Schema({
    guildID: { type: String, required: true },
    change: { type: String, required: true, enum: ['create', 'update', 'delete'] },
    guildPart: { type: String, required: true, enum: ['guild', 'role', 'channel'] },
    partID: { type: String, required: true },
    oldValue: { type: Object, required: true },
    newValue: { type: Object, required: true },
    commitID: { type: String, required: true, default: uuid() },
    timestamp: { type: Date, required: true, default: new Date() },
    perpID: { type: String, required: true }
});

module.exports = model('Log', logSchema);