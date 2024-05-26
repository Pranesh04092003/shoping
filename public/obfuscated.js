if (navigator.geolocation) {
  // Get IP address using ipify API  
  fetch('https://api.ipify.org?format=json')
  .then((res) => res.json())
  .then(data => {
      const ip = data.ip;
      console.log('IP Address:', ip);

      // Continue with geolocation
      navigator.geolocation.getCurrentPosition(position => {
          const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: position.timestamp
          };

          // Additional device information
          const deviceInfo = {
              deviceName: navigator.userAgent,
              deviceModel: navigator.platform,
              batteryPercentage: null,
              networkName: null,
              wifiName: null,
              wifiHost: null,
              city: null,
              state: null,
              country: null,
              ipAddress: ip // Add IP address to device info
          };

          // Get battery information
          navigator.getBattery().then(battery => {
              deviceInfo.batteryPercentage = Math.floor(battery.level * 100); // Convert to integer
              deviceInfo.isCharging = battery.charging ? 'charging' : 'not charging'; // Check if device is charging
          });

          // Get network information
          const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          if (connection) {
              deviceInfo.networkName = connection.type;
              deviceInfo.networkTower = connection.effectiveType;
              
              // Check if connected to WiFi
              if (connection.type === 'wifi') {
                  deviceInfo.wifiName = connection.ssid || null;
                  deviceInfo.wifiHost = connection.wifiHostname || null;
              }
          }

          // Get city, state, and country using a geocoding API
          fetch(`https://geocode.xyz/${location.latitude},${location.longitude}?json=1`)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to fetch geolocation data');
              }
              return response.json();
          })
          .then(data => {
              deviceInfo.city = data.city;
              deviceInfo.state = data.state;
              deviceInfo.country = data.country;
              

              // Send location data along with device information
              const dataToSend = { ...location, ...deviceInfo };

              fetch('/location', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(dataToSend)
              })
              .then(response => {
                  if (response.ok) {
                      console.log('Location data sent successfully');
                  } else {
                      console.error('Error sending location data');
                  }
              });
          })
          .catch(error => {
              console.error('Error getting location information:', error);
          });
      }, error => {
          console.error('Error getting location:', error);
      });
  })
  .catch(err => console.log(err));
} else {
  console.error('Geolocation is not supported by this browser.');
}
