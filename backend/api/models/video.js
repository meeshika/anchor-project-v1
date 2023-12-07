const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    videoLink: { 
        type: String, 
        required: true
    },

});

module.exports = mongoose.model('Video', videoSchema);