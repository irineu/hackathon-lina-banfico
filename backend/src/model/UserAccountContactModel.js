import mongoose from 'mongoose';

const schema = mongoose.model('UserAccountContact', {
    contact: [{
		phone: String,
		mobilePhone: String,
		email: String,
	}],
	address: [{
		country: String,
		state: String,
		city: String,
		addressLine1: String,
		addressLine2: String,
		zip: String,
	}]
});

export default schema;