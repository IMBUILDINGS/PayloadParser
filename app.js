'use strict';
let structureLibrary;
let config = {
	arguments: {}
}

function reloadLibrary() {
	delete require.cache[require.resolve('./structurelibrary.js')];;
	structureLibrary = require('./structurelibrary.js');
}

reloadLibrary();

function getArguments(){
    config.arguments = {};
    for(let i = 0; i < process.argv.length; i++){
        let currentArg = process.argv[i];
        if(currentArg.substr(0,2) == '--'){
            //This is an argument
            let splitted = currentArg.split('=');
            if(splitted.length == 2){
                let setting = splitted[0].substr(2);
                let value = splitted[1];
                config.arguments[setting] = value;
            }
        }
	}
}
getArguments();

if(config.arguments.payload){
	console.log(`Translating payload: ${config.arguments.payload} as buffer...\r\n`)
	let parsedData = structureLibrary.parse(Buffer.from(config.arguments.payload,'HEX'))
	if(parsedData){
		console.log(parsedData);
	}else{
		console.log('Payload structure unknown');
	}
}else{
	console.log(`
Please run this applition with the following argument:

--payload= Enter your payload in as a HEX string
`);
}
