/*
    IMBUILDINGS Payload decoder for The Things Network
    ===========================================================
    Version  : 1.0
    Author   : Ronald Conen
*/

function Decoder(bytes, port){
    var decoded = {};

    if(bytes.length > 2){
        var payload_type = bytes[0];

        switch(payload_type){
            case 1:
                //Comfort Sensor
                decoded = parseComfortSensor(bytes);
                break;
            case 2:
                //People Counter
                decoded = parsePeopleCounter(bytes);
                break;
            case 3:
                //Button
                decoded = parseButton(bytes);
                break;
            case 4:
                //Pulse Counter
                decoded = parsePulseCounter(bytes);
                break;
        }
    }

    return decoded;
}


function bcd(dec) {
	return ((dec / 10) << 4) + (dec % 10);
}

function unbcd(bcd) {
	return ((bcd >> 4) * 10) + bcd % 16;
}

function toHEXString(payload, index, length){
    var HEXString = '';

    for(var i = 0; i < length; i++){
        if(payload[index + i] < 16){
            HEXString = HEXString + '0';
        }
        HEXString = HEXString + payload[index + i].toString(16);
    }

    return HEXString;
}

function readInt16BE(payload, index){
    var int16 = (payload[index] << 8) + payload[++index];

    if(int16 & 0x8000){
        int16 = - (0x10000 - int16);
    }

    return int16;
}

function readUInt16BE(payload, index){
    return (payload[index] << 8) + payload[++index];
}

function readInt8(payload, index){
    var int8 = payload[index];

    if(int8 & 0x80){
        int8 = - (0x100 - int8);
    }

    return int8;
}

function parseComfortSensor(payload){
    var payload_variant = payload[1];

    var deviceData = {
        //received_at: new Date().toISOString(),        //Not supported on TTN
        device_type_identifier: payload[0],
        device_type: 'Comfort Sensor CO2',
        device_type_variant: payload[1],
        device_id: toHEXString(payload, 2, 6),
        battery_voltage: readUInt16BE(payload, 9) / 100,
        rssi: readInt8(payload, 11)
    };

    switch(payload_variant){
        case 1:     //NB-IoT Payload
            if(payload.length != 19) return {};
            deviceData.temperature = readInt16BE(payload, 12) / 100;
            deviceData.humidity = readUInt16BE(payload, 14) / 100;
            deviceData.presence = payload[18];
            deviceData.co2 = readUInt16BE(payload,16);
            return deviceData;
        case 2:     //NB-IoT Payload
            if(payload.length != 25) return {};
            // var datetime = Date.UTC(
            //     unbcd(payload[12] * 100 + unbcd(payload[13])),
            //     unbcd(payload[14] - 1),
            //     unbcd(payload[15]),
            //     unbcd(payload[16]),
            //     unbcd(payload[17]),
            //     unbcd(payload[18]),
            //     0
            // );
            // deviceData.datetime = datetime.toISOString();        //Not supported on TTN
            deviceData.temperature = readInt16BE(payload, 19) / 100;
            deviceData.humidity = readUInt16BE(payload, 21) / 100;
            deviceData.presence = payload[25];
            deviceData.co2 = readUInt16BE(payload, 23);
            return deviceData;
        case 3:
            //To be implemented
            return deviceData;
    }

    return {};
}

function parsePeopleCounter(payload){
    var payload_variant = payload[1];

    var deviceData = {
        //received_at: new Date().toISOString(),        //Not supported on TTN
        device_type_identifier: payload[0],
        device_type: 'People Counter',
        device_type_variant: payload[1],
        device_id: toHEXString(payload, 2, 6),
        device_status: payload[8],
        battery_voltage: readUInt16BE(payload, 9) / 100,
        rssi: readInt8(payload, 11)
    };

    switch(payload_variant){
        case 1:     //NB-IoT People Counter payload
            if(payload.length != 22) return {};
            break;
        case 2:     //NB-IoT People Counter payload
            if(payload.length != 15) return {};
            deviceData.counter_a = payload[12];
            deviceData.counter_b = payload[13];
            deviceData.sensor_status = payload[14];
            return deviceData;
        case 3:     //NB-IoT People Counter payload
            if(payload.length != 17) return {};
            deviceData.counter_a = readUInt16BE(payload, 12);
            deviceData.counter_b = readUInt16BE(payload, 14);
            deviceData.sensor_status = payload[16];
            return deviceData;
        case 4:     //NB-IoT People Counter payload
            if(payload.length != 24) return {};
            // var datetime = new Date.UTC(
            //     unbcd(payload[12] * 100 + unbcd(payload[13])),
            //     unbcd(payload[14] - 1),
            //     unbcd(payload[15]),
            //     unbcd(payload[16]),
            //     unbcd(payload[17]),
            //     unbcd(payload[18]),
            //     0
            // );
            // deviceData.datetime = datetime.toISOString();        //Not supported on TTN
            deviceData.counter_a = readUInt16BE(payload, 19);
            deviceData.counter_b = readUInt16BE(payload, 21);
            deviceData.sensor_status = payload[23];
            return deviceData;
        case 5:     //LoRaWAN People Counter payload
            if(payload.length != 19) return {};
            deviceData.device_id = toHEXString(payload, 2, 8);
            deviceData.device_status = payload[10];
            deviceData.battery_voltage = readUInt16BE(payload, 11) / 100;
            delete deviceData.rssi;
            deviceData.counter_a = readUInt16BE(payload, 13);
            deviceData.counter_b = readUInt16BE(payload, 15);
            deviceData.sensor_status = payload[17];
            deviceData.payload_counter = payload[18];
            return deviceData;
        case 6:     //LoRaWAN People Counter payload
            if(payload.length != 23) return {};
            deviceData.device_id = toHEXString(payload, 2, 8);
            deviceData.device_status = payload[10];
            deviceData.battery_voltage = readUInt16BE(payload, 11) / 100;
            delete deviceData.rssi;
            deviceData.counter_a = readUInt16BE(payload, 13);
            deviceData.counter_b = readUInt16BE(payload, 15);
            deviceData.sensor_status = payload[17];
            deviceData.total_counter_a = readUInt16BE(payload, 18);
            deviceData.total_counter_b = readUInt16BE(payload, 20);
            deviceData.payload_counter = payload[22];
            return deviceData;
        case 7:     //LoRaWAN People Counter
            //To be implemented
            return deviceData;
    }

    return {};
}

function parseButton(payload){
    var payload_variant = payload[1];

    var deviceData = {
        //received_at: new Date().toISOString(),        //Not supported on TTN
        device_type_identifier: payload[0],
        device_type: 'Button',
        device_type_variant: payload[1],
        device_id: toHEXString(payload, 2, 6),
        device_status: payload[8],
        battery_voltage: readUInt16BE(payload, 9) / 100,
        rssi: readInt8(payload, 11),
        button_pressed: 0x01 & payload[12]
    };

    switch(payload_variant){
        case 1:     //NB-IoT Payload
        case 3:     //NB-IoT Payload
            if(payload.length != 13) return {};
            return deviceData;
        case 2:     //NB-IoT Payload
            if(payload.length != 20) return {};
            deviceData.button_pressed = 0x01 & payload[19];
            // var datetime = new Date.UTC(
            //     unbcd(payload[12] * 100 + unbcd(payload[13])),
            //     unbcd(payload[14] - 1),
            //     unbcd(payload[15]),
            //     unbcd(payload[16]),
            //     unbcd(payload[17]),
            //     unbcd(payload[18]),
            //     0
            // );
            // deviceData.datetime.toISOString();       //Not supported on TTN
            return deviceData;
    }

    return {};
}

function parsePulseCounter(payload){
    var payload_variant = payload[1];

    var deviceData = {
        //received_at: new Date().toISOString(),        //Not supported on TTN
        device_type_identifier: payload[0],
        device_type: 'Counter',
        device_type_variant: payload[1],
        device_id: toHEXString(payload, 2, 6),
        device_status: payload[8],
        battery_voltage: readUInt16BE(payload, 9) / 100,
        rssi: readInt8(payload, 11),
        counter: payload[19]
    };

    switch(payload_variant){
        case 1:     //NB-IoT Payload
            if(payload.length != 20) return {};
            return deviceData;
    }

    return {};
}

