exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const url = 'https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=xwB0h4XAfDn0gDrtGYda9YheLlZBPFLsN7Pi8njh&fuel_type=ELEC&limit=10';
        
        console.log('Calling NREL API:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        const data = await response.json();
        console.log('Response data keys:', Object.keys(data));
        console.log('Response data:', JSON.stringify(data).substring(0, 500));

        // Check if fuel_stations exists
        if (!data.fuel_stations) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'No fuel_stations in response',
                    debug: {
                        responseKeys: Object.keys(data),
                        dataPreview: JSON.stringify(data).substring(0, 300)
                    }
                })
            };
        }

        const stations = data.fuel_stations.slice(0, 10).map(station => ({
            id: station.id,
            name: station.station_name,
            address: station.street_address || '',
            city: station.city || '',
            state: station.state || '',
            zip: station.zip || ''
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                total: stations.length,
                stations: stations,
                debug: 'Function working!'
            })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            })
        };
    }
};