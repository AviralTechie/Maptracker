var map = L.map('map').setView([28.2380, 83.9956], 11);

        // Tile layer from OpenStreetMap
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: 'Leaflet &copy; OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        // Vehicle icon
        var taxiIcon = L.icon({
            iconUrl: 'src/car-private-car-svgrepo-com.svg',
            iconSize: [70, 70]
        });

        // Past location data
        var pastLocations = [
            { "latitude": 28.2380, "longitude": 83.9956 }, // Starting point
            { "latitude": 28.2390, "longitude": 83.9966 },
            { "latitude": 28.2400, "longitude": 83.9976 },
            { "latitude": 28.2410, "longitude": 83.9986 },
            { "latitude": 28.2420, "longitude": 83.9996 }
        ];

        // Create a polyline for the route
        var routeLine = L.polyline(pastLocations.map(loc => [loc.latitude, loc.longitude]), { color: 'blue' }).addTo(map);

        // Fit the map to the route
        map.fitBounds(routeLine.getBounds());

        // Add a marker at the starting point
        var marker = L.marker([pastLocations[0].latitude, pastLocations[0].longitude], { icon: taxiIcon }).addTo(map);

        // Variables for controlling movement
        var index = 0;
        var isMoving = false;
        var intervalId = null;
        var totalDuration = 5000; // Total duration for movement (in milliseconds)
        var numLocations = pastLocations.length;

        // Get the slider element
        var timelineSlider = document.getElementById('timeline');
        timelineSlider.max = numLocations - 1; // Set slider max to the number of locations

        // Interpolate between two points (returns a LatLng between p1 and p2 based on t)
        function interpolate(p1, p2, t) {
            return L.latLng(
                p1.lat + (p2.lat - p1.lat) * t,
                p1.lng + (p2.lng - p1.lng) * t
            );
        }

        // Move marker smoothly along the polyline
        function moveMarkerSmoothly() {
            if (index < pastLocations.length - 1) {
                var startLocation = pastLocations[index];
                var endLocation = pastLocations[index + 1];
                var duration = totalDuration / (pastLocations.length - 1); // Time for each segment
                var steps = 100;  // Number of steps to take between the points
                var stepDuration = duration / steps;
                var stepIndex = 0;

                function moveStep() {
                    if (stepIndex <= steps && isMoving) {
                        var latLng = interpolate(
                            { lat: startLocation.latitude, lng: startLocation.longitude },
                            { lat: endLocation.latitude, lng: endLocation.longitude },
                            stepIndex / steps
                        );
                        marker.setLatLng(latLng);
                        stepIndex++;
                        setTimeout(moveStep, stepDuration);
                    } else {
                        index++;
                        if (index < pastLocations.length - 1 && isMoving) {
                            timelineSlider.value = index; // Update slider to reflect current position
                            moveMarkerSmoothly();  // Move to the next segment
                        }
                    }
                }

                moveStep();
            } else {
                clearInterval(intervalId); // Stop movement when last point is reached
            }
        }

        // Play the movement
        function playMovement() {
            if (!isMoving) {
                isMoving = true;
                moveMarkerSmoothly();  // Start moving along the path
            }
        }

        // Pause the movement
        function pauseMovement() {
            isMoving = false;
            clearInterval(intervalId);  // Stop the movement
        }

        // Event listeners for play and pause buttons
        document.getElementById('playBtn').addEventListener('click', playMovement);
        document.getElementById('pauseBtn').addEventListener('click', pauseMovement);

        // Event listener for the timeline slider
        timelineSlider.addEventListener('input', function() {
            pauseMovement(); // Pause movement when user drags the slider
            index = parseInt(this.value); // Set the current index based on slider position
            var currentLocation = pastLocations[index];
            marker.setLatLng([currentLocation.latitude, currentLocation.longitude]); // Update marker position
        });

        // Initially set the marker at the first position
        pauseMovement();