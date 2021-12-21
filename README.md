# IMBuildings PayloadParser
Example library for parsing payload for IMBUILDINGS LoRaWAN and NB-IoT Products

Please note that the following files using Node JS Buffer objects
- structurelibrary.js
- example_parser.js
*Above files are deprecated and will be removed from this repository in a next release*

App.js uses the TTN V3 IMBuildings decoder
Run App.js with the `--payload=` argument. This argument requires a hex string

`node app.js --payload=02060004A30B00F6B5690800F80003000220060305E661`

```
{ 
    received_at: '2021-12-20T19:58:58.754Z',
    payload_type: 2,
    payload_variant: 6,
    device_id: '0004a30b00f6b569',
    device_status: 8,
    battery_voltage: 2.48,
    counter_a: 3,
    counter_b: 2,
    sensor_status: 32,
    total_counter_a: 1539,
    total_counter_b: 1510,
    payload_counter: 97 
}
```

It is also possible to decode a Base64 string by using `--base64=` instead of `--payload=`.
For payloads without header information the `--fport=` argument can be used. This will trigger port based decoding as a LoRaWAN function.

---

## The Things Network V3- Decoder
In the ttn-v3 folder you will find the decoders for the IMBuildings People Counter (and also for the Office Occupancy Counter) and IMBuildings Comfort Sensor.
Just copy and past the JavaScript in the Uplink payload formatter editor. Do not forget to select JavaScript as Formatter type.

### imbuildings-decoder.js
This decoder is able to decode payload without header information.
To allow this the decoder needs to the LoRaWAN fPort number.
It will make assumptions based on the fPort used.

This decoder may be a newer version compared with the one on TTN.

To allow this decoder to be used with the App.js file there are some lines at the end of the file which are not within the official TTN release of the file.

---

## Chirpstack decoder
Currently contains only a decoder for the People Counter (which also works for the Office Occupancy Counter).
This decoder is similar to the TTN decoder.