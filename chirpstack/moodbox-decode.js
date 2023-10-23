// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
function Decode(fPort, bytes, variables) {
  var d = {};

  	  var p = {
        bytes: bytes,
        fPort: fPort
      }
  
      if(!containsIMBHeader(p.bytes)){
        //When payload doesn't contain IMBuildings header
        //Assumes that payload is transmitted on specific fport
        //e.g. payload type 3 variant 3 on FPort 33, type 3 variant 4 on FPort 34 and so on...
        switch(p.fPort){
            case 33:
                if(p.bytes.length != 4){
                    return { errors: ['Unable to detect correct payload. Please check your device configuration']};
                }

                d.payload_type = 3;
                d.payload_variant = 3;
                break;
            case 34:
                if(p.bytes.length != 1){
                    return { errors: ['Unable to detect correct payload. Please check your device configuration']};
                }

                d.payload_type = 3;
                d.payload_variant = 4;
                break;
            default:
                return { errors: ['Unable to detect correct payload. Please check your device configuration']};
        }
    }else{
        d.payload_type = p.bytes[0];
        d.payload_variant = p.bytes[1];
        d.device_id = toHEXString(p.bytes, 2, 8)
    }

    switch(d.payload_variant){
        case 0x03:
            d.device_status = p.bytes[p.bytes.length - 4];
            d.battery_voltage = readUInt16BE(p.bytes, p.bytes.length - 3) / 100;
            d.button_pressed = (p.bytes[p.bytes.length - 1] != 0) ? true : false;
            d.button = {
                a: ((p.bytes[p.bytes.length - 1] & 0x01) == 0x01) ? true : false,
                b: ((p.bytes[p.bytes.length - 1] & 0x02) == 0x02) ? true : false,
                c: ((p.bytes[p.bytes.length - 1] & 0x04) == 0x04) ? true : false,
                d: ((p.bytes[p.bytes.length - 1] & 0x08) == 0x08) ? true : false,
                e: ((p.bytes[p.bytes.length - 1] & 0x10) == 0x10) ? true : false
            }
            break;
        case 0x04:
            d.device_status = p.bytes[p.bytes.length - 13];
            d.battery_voltage = readUInt16BE(p.bytes, p.bytes.length - 12) / 100;
            d.button = {
                a: readUInt16BE(p.bytes, p.bytes.length - 10),
                b: readUInt16BE(p.bytes, p.bytes.length - 8),
                c: readUInt16BE(p.bytes, p.bytes.length - 6),
                d: readUInt16BE(p.bytes, p.bytes.length - 4),
                e: readUInt16BE(p.bytes, p.bytes.length - 2)
            }
            break;
    }
  
  return d;
}

function containsIMBHeader(p){
    if(p[0] == 0x03 && p[1] == 0x03 && p.length == 14) return true;
    if(p[0] == 0x03 && p[1] == 0x04 && p.length == 23) return true;

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
