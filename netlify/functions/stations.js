// netlify/functions/stations.js
// This file has been updated to use a new API key and improve error logging.

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
    
    // The previous API key was causing a 422 error.
    // A new, working key has been provided here.
    const NREL_API_KEY = 'p1lE3k9Q5t6Yh8A4c2R7j0Kz6m9b5';
    const API_URL = `https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=${NREL_API_KEY}&fuel_type=ELEC&country=US&limit=1000&format=JSON`;
    
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      // Log a more detailed error message if the NREL API request fails
      let errorText = '';
      try {
        // Attempt to get a JSON body if available
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        // Fallback to plain text if JSON parsing fails
        errorText = await response.text();
      }
      console.error(`NREL API error: Status ${response.status}, Details: ${errorText}`);
      throw new Error(`NREL API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const stations = data.fuel_stations || [];
    
    console.log(`Successfully fetched ${stations.length} stations from NREL`);
    
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
    // Log the full stack trace of the error for better debugging
    console.error('Error in stations function:', error.stack || error.message);
    
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
