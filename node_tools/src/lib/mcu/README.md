# What is the MCU

We may not know exactly why August called this service MCU
we can have a damn good guess. MCU is a common term which
is short for microcontroller unit. In an August lock all
messages sent to the MCU service are decrypted by the
TI CC2541 and sent to the STM32L152CC. The STM32L is
responsibile for the opening and closing of the lock along
with sound, led animation, auto relocking, and many of the
other features which make the August lock "smarter"
than a traditional lock.


## MCU Service UUIDS

| Name     | MCU Service UUIDs                | Model  |
|----------|----------------------------------|--------|
| Write    | bd4ac6110b4511e38ffd0800200c9a66 | ASL-01 |
| Indicate | bd4ac6120b4511e38ffd0800200c9a66 | ASL-01 |
| Write    | e295c55169d011e4b116123b93f75cba | ASL-02 |
| Indicate | e295c55269d011e4b116123b93f75cba | ASL-02 |

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



