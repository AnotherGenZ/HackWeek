const { Schema, model } = require('mongoose');
const { v1: uuid } = require('uuid');

const logSchema = new Schema({
    guildID: { type: String, required: true },
    change: { type: String, required: true, enum: ['create', 'update', 'delete'] },
    guildPart: { type: String, required: true, enum: ['guild', 'role', 'channel'] },
    partID: { type: String, required: true },
    oldValue: { type: Object, required: true },
    newValue: { type: Object, required: true },
    commitID: { type: String, required: true, default: uuid() }
});

module.exports = model('Log', logSchema);