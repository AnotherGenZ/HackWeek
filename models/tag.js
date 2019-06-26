const { Schema, model } = require('mongoose');

const tagSchema = new Schema({
    guildID: { type: String, required: true },
    tag: { type: String, required: true },
    commitID: { type: String, required: true }
});

module.exports = model('Tag', tagSchema);