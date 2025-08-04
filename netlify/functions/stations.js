exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const url = 'https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=xwB0h4XAfDn0gDrtGYda9YheLlZBPFLsN7Pi8njh&fuel_type=ELEC&limit=1000';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`NREL API error: ${response.status}`);
        }

        const data = await response.json();

        const processedStations = data.fuel_stations
            .filter(station => station.latitude && station.longitude && station.station_name)
            .map(station => ({
                id: station.id,
                name: station.station_name,
                address: station.street_address || '',
                city: station.city || '',
                state: station.state || '',
                zip: station.zip || '',
                latitude: parseFloat(station.latitude),
                longitude: parseFloat(station.longitude),
                network: station.ev_network || 'Non-Networked',
                phone: station.station_phone || '',
                website: station.ev_network_web || '',
                hours: station.access_days_time || '',
                access: station.access_code || 'unknown',
                level1_ports: station.ev_level1_evse_num || 0,
                level2_ports: station.ev_level2_evse_num || 0,
                dc_fast_ports: station.ev_dc_fast_num || 0,
                updated: station.updated_at
            }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                total: processedStations.length,
                stations: processedStations
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};