// netlify/functions/stations.js
// Fixed version that works with Git deployments

exports.handler = async (event, context) => {
  // Add CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Starting NREL API request...');
    
    const NREL_API_KEY = 'xwB0h4XAfDn0gDrtGYda9YheLlZBPFLsN7Pi8njh';
    const API_URL = `https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=${NREL_API_KEY}&fuel_type=ELEC&country=US&limit=1000&format=JSON`;
    
    // Use built-in fetch (available in Netlify runtime)
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      console.error(`NREL API error: ${response.status} ${response.statusText}`);
      throw new Error(`NREL API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const stations = data.fuel_stations || [];
    
    console.log(`Successfully fetched ${stations.length} stations from NREL`);
    
    // Return formatted response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        stations: stations,
        total: data.total_results || stations.length,
        lastUpdated: new Date().toISOString(),
        message: `Loaded ${stations.length} charging stations`
      })
    };
    
  } catch (error) {
    console.error('Error in stations function:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stations: [],
        total: 0,
        message: 'Failed to load charging stations'
      })
    };
  }
};