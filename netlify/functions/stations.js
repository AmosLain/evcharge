// netlify/functions/stations.js
exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get parameters from query string
        const { state = '', limit = '1000' } = event.queryStringParameters || {};

        // Build NREL API URL with your key
        const params = new URLSearchParams({
            api_key: 'xwB0h4XAfDn0gDrtGYda9YheLlZBPFLsN7Pi8njh',
            fuel_type: 'ELEC',
            status: 'E', // Available stations only
            limit: limit,
            format: 'json'
        });

        // Add state filter if provided
        if (state) {
            params.append('state', state);
        }

        const nrelUrl = `https://developer.nrel.gov/api/alt-fuel-stations/v1.json?${params}`;
        
        console.log('Fetching from NREL API...');

        // Fetch from NREL API
        const response = await fetch(nrelUrl);
        
        if (!response.ok) {
            throw new Error(`NREL API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.fuel_stations) {
            throw new Error('Invalid NREL API response');
        }

        // Process and clean the data
        const processedStations = data.fuel_stations.map(station => ({
            id: station.id,
            name: station.station_name || 'Unknown Station',
            address: station.street_address || '',
            city: station.city || '',
            state: station.state || '',
            zip: station.zip || '',
            latitude: parseFloat(station.latitude) || 0,
            longitude: parseFloat(station.longitude) || 0,
            network: station.ev_network || 'Independent',
            phone: station.station_phone || '',
            website: station.ev_network_web || '',
            hours: station.access_days_time || '',
            access: station.access_code || 'unknown',
            level1_ports: station.ev_level1_evse_num || 0,
            level2_ports: station.ev_level2_evse_num || 0,
            dc_fast_ports: station.ev_dc_fast_num || 0,
            updated: station.updated_at
        })).filter(station => 
            station.latitude !== 0 && 
            station.longitude !== 0 && 
            station.name && 
            station.name !== 'Unknown Station'
        );

        console.log(`Processed ${processedStations.length} stations`);

        // Return success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                total: processedStations.length,
                stations: processedStations,
                metadata: {
                    fetched_at: new Date().toISOString(),
                    source: 'NREL Alternative Fuels Data Center'
                }
            })
        };

    } catch (error) {
        console.error('Netlify Function Error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                fallback_available: true
            })
        };
    }
};