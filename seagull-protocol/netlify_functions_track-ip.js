const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'ip-data.json');

exports.handler = async function(event, context) {
    const clientIp = event.headers['client-ip'] || 'unknown';
    
    try {
        // Read existing data
        let ipData = {};
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            ipData = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, initialize empty
            ipData = {};
        }

        if (event.httpMethod === 'GET') {
            // Return current state for this IP
            return {
                statusCode: 200,
                body: JSON.stringify(ipData[clientIp] || { failedAttempts: 0, audioPlayed: false })
            };
        } else if (event.httpMethod === 'POST') {
            // Update state for this IP
            const newState = JSON.parse(event.body);
            ipData[clientIp] = {
                failedAttempts: newState.failedAttempts || 0,
                audioPlayed: newState.audioPlayed || false
            };
            
            // Write updated data
            await fs.writeFile(DATA_FILE, JSON.stringify(ipData, null, 2));
            
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'State updated' })
            };
        }
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};