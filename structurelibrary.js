//deprecated
//This file will not be maintained anymore
//This file will be removed in a next release

const moment = require('moment');

function bcd(dec) {
	return ((dec / 10) << 4) + (dec % 10);
}

function unbcd(bcd) {
	return ((bcd >> 4) * 10) + bcd % 16;
}

let structureLibrary = {
	parse: (data) => {
		let payloadType = data[0];
		if (structureLibrary[payloadType] == undefined) {
			return false;
		} else {
			return structureLibrary[payloadType].parse(data);
		}
	},
	'1': {
		name: 'Comfort Sensor CO2',
		parse: (data) => {
			let device = {
				received_at: new Date().toISOString(),
				device_type_identifier: data[0],
				device_type: structureLibrary[data[0]].name,
				device_type_variant: data[1],
				device_id: data.toString('HEX', 2, 8),
				device_status: data.readUInt8(8),
				battery_voltage: data.readUInt16BE(9) / 100,
				rssi: data.readInt8(11),
			}

			//Variant
			switch (data[1]) {
				case 1:
					if(data.length != 19) return false;
					device.temperature = data.readInt16BE(12) / 100;
					device.humidity = data.readUInt16BE(14) / 100;
					device.presence = data.readUInt8(18);
					device.co2 = data.readUInt16BE(16);
					break;
				case 2:
					if(data.length != 26) return false;
					let datetime = moment.utc();
					datetime.year(unbcd(data[12]) * 100 + unbcd(data[13]));
					datetime.month(unbcd(data[14]) - 1);
					datetime.date(unbcd(data[15]));
					datetime.hour(unbcd(data[16]));
					datetime.minute(unbcd(data[17]));
					datetime.second(unbcd(data[18]));
					device.datetime = datetime.format();

					device.temperature = data.readInt16BE(19) / 100;
					device.humidity = data.readUInt16BE(21) / 100;
					device.presence = data.readUInt8(25);
					device.co2 = data.readUInt16BE(23);
					break;
				default: return false;
			}


			return device;
		}
	},
	'2': {
		name: 'People Counter',
		parse: (data) => {
			let device = {
				received_at: new Date().toISOString(),
				device_type_identifier: data[0],
				device_type: structureLibrary[data[0]].name,
				device_type_variant: data[1],
				device_id: data.toString('HEX', 2, 8),
				device_status: data.readUInt8(8),
				battery_voltage: data.readUInt16BE(9) / 100,
				rssi: data.readInt8(11),
			}

			//Variant
			switch (data[1]) {
				case 1:
					if(data.length != 22) return false;
					break;
				case 2:
					if(data.length != 15) return false;
					device.counter_a = data[12];
					device.counter_b = data[13];
					device.sensor_status = data[14];
					break;
				case 3:
					if(data.length != 17) return false;
					device.counter_a = data.readUInt16BE(12);
					device.counter_b = data.readUInt16BE(14);
					device.sensor_status = data[16];
					break;
				case 4:
					if(data.length != 24) return false;
					let datetime = moment.utc();
					datetime.year(unbcd(data[12]) * 100 + unbcd(data[13]));
					datetime.month(unbcd(data[14]) - 1);
					datetime.date(unbcd(data[15]));
					datetime.hour(unbcd(data[16]));
					datetime.minute(unbcd(data[17]));
					datetime.second(unbcd(data[18]));
					device.datetime = datetime.format();
					device.counter_a = data.readUInt16BE(19);
					device.counter_b = data.readUInt16BE(21);
					device.sensor_status = data[23];
					break;
				case 5:
					if(data.length != 19) return false;
					device.device_id = data.toString('HEX', 2, 10);
					device.device_status= data.readUInt8(10);
					device.battery_voltage = data.readUInt16BE(11) / 100,
					delete device.rssi;
					device.counter_a = data.readUInt16BE(13);
					device.counter_b = data.readUInt16BE(15);
					device.sensor_status = data[17];
					device.payload_counter = data[18];
					break;
				case 6:
					if(data.length != 23) return false;
					device.device_id = data.toString('HEX', 2, 10);
					device.device_status= data.readUInt8(10);
					device.battery_voltage = data.readUInt16BE(11) / 100,
					delete device.rssi;
					device.counter_a = data.readUInt16BE(13);
					device.counter_b = data.readUInt16BE(15);
					device.sensor_status = data[17];
					device.total_counter_a = data.readUInt16BE(18);
					device.total_counter_b = data.readUInt16BE(20);
					device.payload_counter = data[22];
					break;
				default: return false;
			}
			return device;
		}
	},
	'3': {
		name: 'Button',
		parse: (data) => {
			let device = {
				received_at: new Date().toISOString(),
				device_type_identifier: data[0],
				device_type: structureLibrary[data[0]].name,
				device_id: data.toString('HEX', 2, 8),
				device_status: data.readUInt8(8),
				battery_voltage: data.readInt16BE(9) / 100,
				rssi: data.readInt8(11),
				button_pressed: 0x01 & data[12]
			}

			switch (data[1]) {
				case 1:
				case 3:
					if(data.length != 13) return false;
					break;
				case 2:
					if(data.length != 20) return false;
					device.button_pressed = 0x01 & data[19];
					let datetime = moment.utc();
					datetime.year(unbcd(data[12]) * 100 + unbcd(data[13]));
					datetime.month(unbcd(data[14]) - 1);
					datetime.date(unbcd(data[15]));
					datetime.hour(unbcd(data[16]));
					datetime.minute(unbcd(data[17]));
					datetime.second(unbcd(data[18]));
					device.datetime = datetime.format();
					break;
				default: return false;
			}

			return device;
		}
	},
	'4': {
		name: 'Counter',
		parse: (data) => {
			let device = {
				received_at: new Date().toISOString(),
				device_type_identifier: data[0],
				device_type: structureLibrary[data[0]].name,
				device_id: data.toString('HEX', 2, 8),
				device_status: data.readUInt8(8),
				battery_voltage: data.readInt16BE(9) / 100,
				rssi: data.readInt8(11),
				counter: data[19]
			}

			let datetime = moment.utc();
			datetime.year(unbcd(data[12]) * 100 + unbcd(data[13]));
			datetime.month(unbcd(data[14]) - 1);
			datetime.date(unbcd(data[15]));
			datetime.hour(unbcd(data[16]));
			datetime.minute(unbcd(data[17]));
			datetime.second(unbcd(data[18]));
			device.datetime = datetime.format();

			switch(data[1]){
				case 1:
					if(data.length != 20) return false;
					break;
				default: return false;
			}

			return device;
		}
	},
	'5':{
		name: 'Tracker',
		parse: (data) => {
			let device = {
				received_at: new Date().toISOString(),
				device_type_identifier: data[0],
				device_type: structureLibrary[data[0]].name,
				battery_voltage: data.readInt16BE(2) / 100,
				temperature: data.readInt16BE(4) / 100
			}

			switch(data[1]){
				case 1:
					if(data.length != 6) return false;
					break;
				default: return false;
			}

			return device;
		}
	},
	'6':{
		name: 'Contact Sensor',
		parse: (data)=>{
			let device = {
				received_at: new Date().toISOString(),
				device_type_identifier: data[0],
				device_type: structureLibrary[data[0]].name,
				device_id: data.toString('HEX', 2, 8),
				battery_voltage: data.readUInt16BE(9) / 100,
				rssi: data.readInt8(11)
			}

			switch(data[1]){
				case 1:
					let datetime = moment.utc();
					datetime.year(unbcd(data[12]) * 100 + unbcd(data[13]));
					datetime.month(unbcd(data[14]) - 1);
					datetime.date(unbcd(data[15]));
					datetime.hour(unbcd(data[16]));
					datetime.minute(unbcd(data[17]));
					datetime.second(unbcd(data[18]));
					device.datetime = datetime.format();
					device.contact_is_open = ((data[19] & 0x01) == 0x01) ? true : false;
					device.is_event = ((data[19] & 0x02) == 0x02) ? true : false;
					break;
				default: return false;
			}

			return device;

		}
	}
}

module.exports = structureLibrary;
