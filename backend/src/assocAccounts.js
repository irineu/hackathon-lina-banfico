import axios from "axios";
import * as tasks from './tasks.js'
import BankAccountModel from './model/BankAccount.js';

async function calcMedia(tResponse){

    let lastMonths = 3;
    let inMedia = 0;

    if(!tResponse.data.transactions || !tResponse.data.transactions.booked){
        return inMedia;
    }

    var cashIn = tResponse.data.transactions.booked.filter((t) => t.debtorAccount != undefined);
    
    if(cashIn.length < lastMonths){
        return inMedia;
    }

    cashIn = cashIn.reduce((ac, current, index) =>{

        if(index == 1){
            let history = {};

            let dtKey = new Date(ac.bookingDate);
            let key = `${dtKey.getFullYear()}-${dtKey.getMonth() + 1}`
            history[key] = ac.transactionAmount.amount;
            ac = history;
        }

        let dtKey = new Date(current.bookingDate);
        let key = `${dtKey.getFullYear()}-${dtKey.getMonth() + 1}`

        if(!ac[key]){
            ac[key] = current.transactionAmount.amount;
        }else{
            ac[key] += current.transactionAmount.amount;
        }
        return ac;
    });

    let strMonths = Object.keys(cashIn);
    let months = [];

    for(let i = 0; i < strMonths.length; i++){
        months.push(new Date(strMonths[i]+ '-2'));
    }

    months = months.sort(function(a,b){return b.getTime() - a.getTime()});
    
    months = months.map((m) => {
        return `${m.getFullYear()}-${(m.getMonth() + 1)}`
    });

    for(let i = 0; i < lastMonths; i++){
        inMedia += cashIn[months[i]];
    }

    inMedia = inMedia/lastMonths;
    return inMedia;
}

(async () => {
    await tasks.loadCFG();
    await tasks.connectDB();

    let req = axios.create({
        headers: {
          "x-user-id": "guest@fintech7.com.br",
           "x-app-id": "8a00828a762d0fbc01762e98d7c70004"
        }  
      });

    try {
        const response = await req.get("https://aggregator-api.obaf.banfico.com/api/providers/integrated/8a00828a762d0fbc01762d13e1920001/accounts"); 

        for(let i = 0 ; i < response.data.accounts.length; i++){
            const tResponse = await req.get(`https://aggregator-api.obaf.banfico.com/api/providers/integrated/8a00828a762d0fbc01762d13e1920001/accounts/${response.data.accounts[i].resourceId}/transactions`); 
            
            let inMedia = await calcMedia(tResponse);
            
            let account;

            //try{
            account = await BankAccountModel.findOne({remoteId: response.data.accounts[i].resourceId});
            
            if(!account){
                account = new BankAccountModel({
                    remoteId: response.data.accounts[i].resourceId,
                    account: "000" + (i + 1),
                    
                });
            }

            account.lastBalance = tResponse.data.balances[0].balanceAmount.amount,
            account.inMedia = inMedia;

            await account.save();            
        }

        process.exit(0);

    } catch (error) {
        console.error(error);
    }
    
})();
