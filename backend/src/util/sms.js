import AWS from 'aws-sdk';

AWS.config.update({region: 'us-east-1'});


export default {
    sendCode(to, code){
        const sns = new AWS.SNS({ apiVersion: '2010-03-31' })

        return new Promise((resolve, reject) => {
            sns.setSMSAttributes({
                attributes: {
                DefaultSMSType: 'Transactional'
                },
                function(error) {
                if (error) reject(error)
                }
            })
    
            const params = {
                PhoneNumber: "+55"+to,
                Message: `RESOLVE-HOJE: Use o codigo ${code} para assinar a contratacao`,
                MessageStructure: 'string'
            }
    
            sns.publish(params, (err, data) => {
                if (err) { reject(err) }
                resolve();
            });
        });
    }
};
