# What is the MCU

We may not know exactly why August Called this service MCU
we can have a damn good guess. MCU is a common term which
is short hand for microcontroller. In an August lock all
messages sent to the MCU service are decrypted by the
TI CC2540 and sent to the STM32L152CC the STM32L is
responsibile for the openning and closing of the lock along
with sound, led animation, auto relocking, and many of the
other features which make the August smart lock smarter
than a traditional lock.


## MCU Service UUIDS

| MCU Service UUIDs                |
|----------------------------------|
| bd4ac6110b4511e38ffd0800200c9a66 |


## Message Structure

Messages to the MCU service follow a simple structure
most messages have the following fields/structure. (fields
are in the order they appear in the messages.)

| Byte index | Length (in bytes) | Name           | Description                                                                                 |
|------------|-------------------|----------------|---------------------------------------------------------------------------------------------|
| 0          | 1                 | Magic          | A magic number (0xEE is for messages to the lock, 0xBB is for messages from the lock)       |
| 1          | 1                 | Command        | The id of the command being run, or that was run.                                           |
| 2          | 1                 | Message Number | If this message is part of a set of messages this value identifies its position in the set. |
| 3          | 1                 | Checksum       | A addition based checksum of the entire messages (except the checksum)                      |
| 4          | 12                | Data           | Up to 12 bytes of data                                                                      |



