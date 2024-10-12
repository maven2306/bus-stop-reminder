let destinationLat, destinationLng;

document.getElementById('setLocation').addEventListener('click', function() {
    const locationInput = document.getElementById('locationInput').value;
    if (locationInput) {
        geocodeAddress(locationInput);
    } else {
        alert('Please enter an address or select a location on the map.');
    }
});

function geocodeAddress(address) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            destinationLat = results[0].geometry.location.lat();
            destinationLng = results[0].geometry.location.lng();
            initMap();
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: destinationLat, lng: destinationLng },
        zoom: 15
    });
    new google.maps.Marker({
        position: { lat: destinationLat, lng: destinationLng },
        map: map,
        title: 'Destination'
    });
    startTracking();
}

function startTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const distance = calculateDistance(userLat, userLng, destinationLat, destinationLng);
            if (distance <= 100) {
                notifyUser();
            }
        }, function(error) {
            alert('Geolocation error: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;
}

function notifyUser() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Bus Stop Reminder', {
            body: 'Hey! You\'re supposed to drop off soon!'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                new Notification('Bus Stop Reminder', {
                    body: 'Hey! You\'re supposed to drop off soon!'
                });
            }
        });
    }
}