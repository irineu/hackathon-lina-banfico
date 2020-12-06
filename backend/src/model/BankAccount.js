import mongoose from 'mongoose';

const schema = mongoose.model('BankAccount', {
    remoteId: String,
    lastBalance: Number,
    account: String,
    inMedia: Number,
});

export default schema;