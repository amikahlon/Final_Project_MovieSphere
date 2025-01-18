import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IRefreshToken {
    token: string;
    validUntil: Date;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string | null;
    profilePicture: string;
    provider: 'google' | 'local';
    providerId?: string;
    role: 'user' | 'admin';
    refreshTokens: IRefreshToken[]; // Array of refresh tokens
    createdAt: Date;
    updatedAt: Date;
    verifyPassword: (password: string) => boolean;
}

const RefreshTokenSchema: Schema = new Schema({
    token: { type: String, required: true },
    validUntil: { type: Date, required: true },
});

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    profilePicture: { type: String, default: '' },
    provider: { type: String, default: 'local' },
    providerId: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshTokens: [RefreshTokenSchema], // Array of refresh tokens
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre<IUser>('save', function (next) {
    if (this.isModified('password') && this.password) {
        const salt = crypto.randomBytes(16).toString('hex'); // Generate a salt
        const hash = crypto.pbkdf2Sync(this.password, salt, 1000, 64, 'sha256').toString('hex');
        this.password = `${salt}:${hash}`; // Store salt and hash together
    }
    this.updatedAt = new Date();
    next();
});

// Method to verify password
UserSchema.methods.verifyPassword = function (password: string): boolean {
    if (!this.password) return false;
    const [salt, storedHash] = this.password.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return storedHash === hash;
};

export default mongoose.model<IUser>('User', UserSchema);
