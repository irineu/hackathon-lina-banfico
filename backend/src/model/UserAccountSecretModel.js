import mongoose from 'mongoose';

const schema = mongoose.model('UserAccountSecret', {
    secretQuestion: String,
    secretAnswer: String,
    password: String,
    recoveryKey: String,
});

export default schema;