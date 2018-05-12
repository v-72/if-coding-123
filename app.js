/*
* APPROACH: 
*        1.Get Data from data source
*        2.Consolidate data based on users
*        3.Calculate subscriptions
*
*/

/* 
 * Require Necessary Modules
*/
const fs = require('fs')
      ,_ = require('lodash');

//Configuration
const config ={
    accounts: './data/accounts.json',
    dataSource: [
                {'source':'wondertel',
                 'file': './data/wondertel.json'},
                 {'source':'amazecom',
                 'file': './data/amazecom.json'}
                ]
};

/*
 * Get all DataSources.
 * TODO: Read all files in data/ directory and build data source, 
 * now reading from config object.
*/
const accounts = createUserObject(require(config.accounts).users);

//Get all data files which are in config
getDataFromSource(config.dataSource).then((data)=>{
     console.log('1. Getting data from Data Source ↵')
     console.log('2. Preprocessing data ↵')
     let finalData = data.map((sourceData)=>{
        return setupDataSource(sourceData).activity;
     })
     finalData = _.sortBy(
          finalData.reduce(
            (_data,arr)=>{
                return arr.concat(_data);
            },[])
        ,['date']);
        f
     console.log('3. Creating Subscription List ↵')
     buildSubscriptionList(finalData);
}).catch((err)=>{
    console.log('An error occured', err.message);
}) 
/*
* Function to create accounts object, 
* This will help in finding the user based on id.
*/
function createUserObject(users){
    let userMap = {};
    users.forEach((user)=>{
        userMap[user.number] =  user.name;
    });
    return userMap;
}

/*
 * Settingup input data 
*/
function setupDataSource(data){
    console.log(' - ',data.source);
    let source = data.source.charAt(0).toUpperCase() + data.source.slice(1);
    data.grants = data.grants.filter((grant)=>{
      if(accounts[grant.number]){
         grant.source = source;
         grant.type = 'grant';
         grant.date = new Date(grant.date).getTime();
         return grant;
       }
    });
    data.revocations = data.revocations.filter((revocation)=>{
        if(accounts[revocation.number]){
            revocation.source = source;
            revocation.type = 'revok'
            revocation.date = new Date(revocation.date).getTime();
            return revocation;
        }
    });
    data.activity = data.grants.concat(data.revocations);
    return data;
}

//Get Data Source
function getDataFromSource(dataSource){
    return new Promise((resolve,reject)=>{
            let data = dataSource.map((source,i)=>{
                 let _data = require(source.file);
                 Object.assign(_data,{source: source.source});
                 return _data;
            })
            resolve(data);
    }) 
}

/*
 * 
 * 
*/
function buildSubscriptionList(data){
    let userSubscriptionList = {};
    createUserDealList(data).then((userDealList)=>{
        Object.keys(userDealList).forEach((_key)=>{
            console.log(accounts[_key]);
        });
        writeToFile("./output/result.json", JSON.stringify({subscriptions: userSubscriptionList}));
    })
}


/*
* 
*/
function createUserDealList(dealList){
    return new Promise((resolve, reject)=>{
        let userDealList = {};
        dealList.forEach((deal)=>{
            if(userDealList[deal.number]){
                userDealList[deal.number].push(deal);
            }else{
                userDealList[deal.number] = [deal];
            }
        })
        resolve(userDealList);
    })
}


/*
 * Function to write output to file
*/ 
function writeToFile(outputFile, data){
    fs.writeFile(outputFile, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("Object has been written",outputFile," file");
    }); 
}

process.on('error',(err)=>{
    console.error('An uncaught error occured', err.stack);
})

module.exports = {
    createUserObject: createUserObject,
    setupDataSource: setupDataSource
}
