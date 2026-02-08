
import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    data: {
        type: Object,
        default: {},
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    history: {
        type: [{
            date: String,
            count: Number
        }],
        default: []
    }
}, {
    timestamps: true,
});

const User = models.User || model('User', UserSchema);

export default User;
