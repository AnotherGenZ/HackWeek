const { Schema, model } = require('mongoose');

const linkSchema = new Schema({
    primaryID: { type: String, required: true },
    forkID: { type: String, required: true },
    primaryPartID:{ type: String, required: true },
    forkPartID: { type: String, required: true },
    type: { type: String, required: true }
});

module.exports = model('Link', linkSchema);