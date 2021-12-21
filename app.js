'use strict';
let parser = require('./ttn-v3/imbuildings-decoder');
let config = {
	arguments: {}
}

function getArguments(){
    config.arguments = {};
    for(let i = 0; i < process.argv.length; i++){
        let currentArg = process.argv[i];
        if(currentArg.substr(0,2) == '--'){
            //This is an argument
            let splitted = currentArg.split('=');
            if(splitted.length > 1){
                let setting = splitted[0].substr(2).toLowerCase();
                let value = splitted[1];
                config.arguments[setting] = value;
            }
        }
	}
}
getArguments();

if(config.arguments.payload){
    console.log(`Translating payload: ${config.arguments.payload} as buffer...\r\n`)
    
    let input = {fPort: parseInt(config.arguments.fport), bytes: Buffer.from(config.arguments.payload,'hex')};
    let parsedData = parser.decode(input);

	if(parsedData){
		console.log(parsedData);
	}else{
		console.log('Payload structure unknown');
	}
}else if(config.arguments.base64){
        console.log(`Translating payload: ${config.arguments.payload} as base64...\r\n`)
        console.log(`Hex view: ${Buffer.from(config.arguments.base64,'base64').toString('hex')}`);
    
        let input = {fPort: parseInt(config.arguments.fport), bytes: Buffer.from(config.arguments.base64,'base64')};
        let parsedData = parser.decode(input);
        if(parsedData){
            console.log(parsedData);
        }else{
            console.log('Payload structure unknown');
        }
}else{
	console.log(`
Please run this applition with the following argument:

--payload= Enter your payload in as a HEX string

OR

--base64= Enter your payload as Base64 string

In case the header is not in the payload you can add --fport= for port based decoding.
`);
}
