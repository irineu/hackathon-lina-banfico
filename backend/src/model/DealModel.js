import mongoose from 'mongoose';

const schema = mongoose.model('Deal', {
    amount: String,
    tax: Number,
    parcels: Number,
    userAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
});

export default schema;