require('dotenv').config(); // Load environment variables from .env file
const tmi = require('tmi.js');
const { SerialPort } = require('serialport'); // Correct import for SerialPort

const accessToken = process.env.ACCESS_TOKEN; // Use the token from the OAuth step
const channelName = 'slurpwaffl'; // Update this to the channel you want to connect to

// Set up the serial port for the display
const port = new SerialPort({
    path: 'COM8',
    baudRate: 9600
});

const client = new tmi.Client({
    options: { debug: true },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: 'iammrbotka', // Updated username
        password: `oauth:${accessToken}`
    },
    channels: [channelName]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) return; // Ignore messages from the bot itself

    // Prepare the message for the display, ensuring it does not exceed the display's width.
    // Each line can hold 20 characters, so we truncate to 40 characters (2 lines).
    let displayMessage = message.substring(0, 40);
    let commandToSend = `\x1B\x51\x41${displayMessage}\r`; // ESC Q A...CR, to write to the upper line

    // Send the prepared message to the display
    port.write(commandToSend, (err) => {
        if (err) {
            return console.log('Error on write to display: ', err.message);
        }
        console.log('Message sent to display');
    });
});

// Handling open errors
port.on('error', function (err) {
    console.log('Error: ', err.message);
});
