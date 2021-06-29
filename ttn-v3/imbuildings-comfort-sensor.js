function decodeUplink(p){
    let d = {};

    if(!containsIMBHeader(p.bytes)){
        switch(p.fPort){
            case 13:
                if(p.bytes.length != 7){
                    return { errors: ['Unable to detect correct payload. Please check your device configuration']};
                }

                d.payload_type = 1;
                d.payload_variant = 3;
                break;
            default:
                return { errors: ['Unable to detect correct payload. Please check your device configuration']};
        }
    }else{
        d.payload_type = p.bytes[0];
        d.payload_variant = p.bytes[1];
        d.device_id = toHEXString(p.bytes, 2, 8);
        d.device_status = p.bytes[p.bytes.length - 10];
        d.battery_voltage = readUInt16BE(p.bytes, p.bytes.length - 9) / 100;
    }

    switch(d.payload_variant){
        case 0x03:
            d.temperature = readUInt16BE(p.bytes, p.bytes.length - 7) / 100;
            d.humidity = readUInt16BE(p.bytes, p.bytes.length - 5) / 100;
            d.CO2 = readUInt16BE(p.bytes, p.bytes.length - 3);
            d.presence = (p.bytes[p.bytes.length - 1] == 1) ? true : false;
            break;
    }

    return {data: d};
}

function containsIMBHeader(p){
    if(p[0] == 0x01 && p[1] == 0x03 && p.length == 20) return true;
    return false;
}



//Helper functions
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
