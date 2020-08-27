//To parse the data into a JSON object call the parse function
//Pass the data as a Buffer to the parse function
//Returns JSON object or false when the payload can not be parsed successfully

function bcd(dec) {
	return ((dec / 10) << 4) + (dec % 10);
}

function unbcd(bcd) {
	return ((bcd >> 4) * 10) + bcd % 16;
}

function parse(payload){
    if(payload.length > 2){
        let payload_type = payload[0];
        
        switch(payload_type){
            case 1:
                //Comfort Sensor
                return parseComfortSensor(payload);
            case 2:
                //People Counter
                return parsePeopleCounter(payload);
            case 3:
                //Button
                return parseButton(payload);
            case 4:
                //Pulse Counter
                return parsePulseCounter(payload);
        }
    }
    
    return false;
}

function parseComfortSensor(payload){
    let payload_variant = payload[1];

    let deviceData = {
        received_at: new Date().toISOString(),
        device_type_identifier: payload[0],
        device_type: 'Comfort Sensor CO2',
        device_type_variant: payload[1],
        device_id: payload.toString('HEX',2,8),
        battery_voltage: payload.readUInt16BE(9) / 100,
        rssi: payload.readInt8(11)
    }

    switch(payload_variant){
        case 1:
            if(payload.length != 19) return false;
            deviceData.temperature = payload.readInt16BE(12) / 100;
            deviceData.humidity = payload.readUInt16BE(14) / 100;
            deviceData.presence = payload.readUInt8(18);
            deviceData.co2 = payload.readUInt16BE(16);
            return deviceData;
        case 2:
            if(payload.length != 25) return false;
            let datetime = Date.UTC(
                unbcd(payload[12] * 100 + unbcd(payload[13])),
                unbcd(payload[14] - 1),
                unbcd(payload[15]),
                unbcd(payload[16]),
                unbcd(payload[17]),
                unbcd(payload[18]),
                0
            );
            deviceData.datetime = datetime.toISOString();
            deviceData.temperature = payload.readInt16BE(19) / 100;
            deviceData.humidity = payload.readUInt16BE(21) / 100;
            deviceData.presence = payload.readUInt8(25);
            deviceData.co2 = payload.readUInt16BE(23);
            return deviceData;
        case 3:
            return deviceData;
    }

    return false;
}

function parsePeopleCounter(payload){
    let payload_variant = payload[1];

    let deviceData = {
        received_at: new Date().toISOString(),
        device_type_identifier: payload[0],
        device_type: 'People Counter',
        device_type_variant: payload[1],
        device_id: payload.toString('HEX',2,8),
        device_status: payload.readUInt8(8),
        battery_voltage: payload.readUInt16BE(9) / 100,
        rssi: payload.readInt8(11)
    };

    switch(payload_variant){
        case 1:
            if(payload.length != 22) return false;
            break;
        case 2:
            if(payload.length != 15) return false;
            deviceData.counter_a = payload[12];
            deviceData.counter_b = payload[13];
            deviceData.sensor_status = payload[14];
            return deviceData;
        case 3:
            if(payload.length != 17) return false;
            deviceData.counter_a = payload.readUInt16BE(12);
            deviceData.counter_b = payload.readUInt16BE(14);
            deviceData.sensor_status = payload[16];
            return deviceData;
        case 4:
            if(payload.length != 24) return false;
            let datetime = new Date.UTC(
                unbcd(payload[12] * 100 + unbcd(payload[13])),
                unbcd(payload[14] - 1),
                unbcd(payload[15]),
                unbcd(payload[16]),
                unbcd(payload[17]),
                unbcd(payload[18]),
                0
            );
            deviceData.datetime = datetime.toISOString();
            deviceData.counter_a = payload.readUInt16BE(19);
            deviceData.counter_b = payload.readUInt16BE(21);
            deviceData.sensor_status = payload[23];
            return deviceData;
        case 5:
            if(payload.length != 19) return false;
            deviceData.device_id = payload.toString('HEX', 2, 10);
            deviceData.device_status = payload.readUInt8(10);
            deviceData.battery_voltage = payload.readUInt16BE(11) / 100,
            delete deviceData.rssi;
            deviceData.counter_a = payload.readUInt16BE(13);
            deviceData.counter_b = payload.readUInt16BE(15);
            deviceData.sensor_status = payload[17];
            deviceData.payload_counter = payload[18];
            return deviceData;
        case 6:
            if(payload.length != 23) return false;
            deviceData.device_id = payload.toString('HEX', 2, 10);
            deviceData.device_status= payload.readUInt8(10);
            deviceData.battery_voltage = payload.readUInt16BE(11) / 100,
            delete deviceData.rssi;
            deviceData.counter_a = payload.readUInt16BE(13);
            deviceData.counter_b = payload.readUInt16BE(15);
            deviceData.sensor_status = payload[17];
            deviceData.total_counter_a = payload.readUInt16BE(18);
            deviceData.total_counter_b = payload.readUInt16BE(20);
            deviceData.payload_counter = payload.readUInt8(22);
            return deviceData;
    }

    return false;
}

function parseButton(payload){
    let payload_variant = payload[1];

    let deviceData = {
        received_at: new Date().toISOString(),
        device_type_identifier: payload[0],
        device_type: 'Button',
        device_type_variant: payload[1],
        device_id: payload.toString('HEX',2,8),
        device_status: payload.readUInt8(8),
        battery_voltage: payload.readUInt16BE(9) / 100,
        rssi: payload.readInt8(11),
        button_pressed: 0x01 & payload[12]
    }

    switch(payload_variant){
        case 1:
        case 3:
            if(payload.length != 13) return false;
            return deviceData;
        case 2:
            if(payload.length != 20) return false;
            deviceData.button_pressed = 0x01 & payload[19];
            let datetime = new Date.UTC(
                unbcd(payload[12] * 100 + unbcd(payload[13])),
                unbcd(payload[14] - 1),
                unbcd(payload[15]),
                unbcd(payload[16]),
                unbcd(payload[17]),
                unbcd(payload[18]),
                0
            );
            deviceData.datetime = datetime.toISOString();
            return deviceData;
    }

    return false;
}

function parsePulseCounter(payload){
    let payload_variant = payload[1];

    let deviceData = {
        received_at: new Date().toISOString(),
        device_type_identifier: payload[0],
        device_type: 'Counter',
        device_type_variant: payload[1],
        device_id: payload.toString('HEX',2,8),
        device_status: payload.readUInt8(8),
        battery_voltage: payload.readUInt16BE(9) / 100,
        rssi: payload.readInt8(11),
        counter: payload[19]
    }

    switch(payload_variant){
        case 1:
            if(payload.length != 20) return false;
            return deviceData;
    }

    return false;
}