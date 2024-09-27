
    const mongoose = require('mongoose');
    const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lessons: [
        {
        level: Number,
        book: Number,
        lesson: Number,
        completedInteractive: Boolean,
        completedGame: Boolean
        }
    ]
    });

    const lessonSchema = new mongoose.Schema({
        level: { type: Number, required: true },
        book: { type: Number, required: true },
        lesson: { type: Number, required: true },
        interactiveContent: { type: String },    // Interactive lesson content
        songsVideosContent: { type: String },    // Songs/Videos content
        gameContent: { type: String },           // Game content
        warmUpContent: { type: String },         // Warm-up content
        moreContent: { type: String },           // 'More' section content
        completedInteractive: { type: Boolean, default: false },  // Progress tracking for interactive lessons
        completedSongsVideos: { type: Boolean, default: false },  // Progress tracking for songs/videos
        completedGames: { type: Boolean, default: false },        // Progress tracking for games
        completedWarmUp: { type: Boolean, default: false },       // Progress tracking for warm-up
        completedMore: { type: Boolean, default: false }          // Progress tracking for 'more' section
    });
    
const lessonexp =mongoose.model('Lesson', lessonSchema)
const userexp = mongoose.model('User', userSchema);

module.exports = {lessonexp, userexp}

