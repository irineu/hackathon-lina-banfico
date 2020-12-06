import mongoose from 'mongoose';

const schema = mongoose.model('UserAccount', {
    username: String,

    secret: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccountSecret' },
    banks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' }],

    firstName: String,
    lastName: String,
    birthDate: Date,
    genere: String,

    contactInformation: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccountContact' },

    creationDate: Date,
    lastLogin: Date,

    invalidLoginCount: Number,
    active: Boolean,
    blocked: Boolean,
    forgotPassword:Boolean,
    
    sessions: [{
        origin: String,
        ip: String,
        creationDate: Date,
        lastUpdate: Date,
        token: String,
    }],
});

  
export default schema;