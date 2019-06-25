const { Schema, model } = require('mongoose');
const { v1: uuid } = require('uuid');

const logSchema = new Schema({
    guildID: { type: String, required: true },
    change: { type: String, required: true, enum: ['create', 'update', 'delete'] },
    guildPart: { type: String, required: true, enum: ['guild', 'role', 'channel'] },
    partID: { type: String, required: true },
    property: { type: String, required: true },
    oldValue: { type: String, required: true },
    newValue: { type: String, required: true },
    uuid: { type: String, required: true, default: uuid() }
});

module.exports = model('Log', logSchema);