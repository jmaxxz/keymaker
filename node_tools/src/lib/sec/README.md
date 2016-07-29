# What is the SEC

SEC is assumed to be short for security, this set of characteristics exposed by the August lock are used to initialize encrypted sessions with lock, manage encryption keys, and interact with the microcontroller which has the bluetooth chip. In the case of the ASL-01 this is a TICC2541. This chip appears to control all functions related to the security of the lock. It also is responsible for the storage of the lock's key material.

## SEC Service UUIDS

| Name     | MCU characteristic UUIDs         | Model  |
|----------|----------------------------------|--------|
| Write    | bd4ac6130b4511e38ffd0800200c9a66 | ASL-01 |
| Indicate | bd4ac6140b4511e38ffd0800200c9a66 | ASL-01 |
| Write    | e295c55369d011e4b116123b93f75cba | ASL-02?|
| Indicate | e295c55469d011e4b116123b93f75cba | ASL-02?|


## Message Structure

Messages sent to and recieved from the SEC service follow a simple structure most messages have the following fields/structure. (Fields are in the order they appear in the messages.)

| Byte index | Length (in bytes) | Name           | Description                                        |
|------------|-------------------|----------------|----------------------------------------------------|
| 0          | 1                 | Command        | A single byte identifying the type of message.     |
| 1          | 11                | Payload        | 11 bytes of message specific information.          |
| 12         | 4                 | Checksum       | A checksum of the first 12 bytes of the message.   |
