/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/busviz`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module('ngBoilerplate.busviz', [
	'ui.state',
	'bustr'
])


/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config($stateProvider) {
	$stateProvider.state('busviz', {
		url: '/busviz',
		views: {
			"main": {
				controller: 'BusVizCtrl',
				templateUrl: 'busviz/busviz.tpl.html'
			}
		},
		data: {
			pageTitle: 'Bus Data Visualization'
		}
	});
})

/**
 * And of course we define a controller for our route.
 */
.controller('BusVizCtrl', function BusVizController($scope, $http) {
	// Milliseconds timestamp of when vehicle locations were last loaded.
	var vehicleLocationsLastUpdated = (new Date()).getTime() - 5 * 60 * 1000;

	$scope.arteries = [];
	$scope.freeways = [];
	$scope.neighborhoods = [];
	$scope.streets = [];

	$scope.vehicles = [];
	var vehiclesMap = {};

	$scope.vehicleRefreshInterval = 3000;
	var vehicleRefreshTimeoutId = null;

	$scope.vehicleRefreshEnabled = true;
	$scope.vehicleDisplayMode = 'normal';

	$scope.selectedVehicleId = null;
	$scope.selectedVehicle = null;


	$scope.$watch('vehicleRefreshEnabled', function(newValue, oldValue) {
		if (newValue && !oldValue) {
			refreshVehicles();
		}
		else if (!newValue && oldValue) {
			if (vehicleRefreshTimeoutId) {
				clearTimeout(vehicleRefreshTimeoutId);
				vehicleRefreshTimeoutId = null;
			}
		}
	});

	$scope.$watch('selectedVehicleId', function(newValue, oldValue) {
		$scope.selectedVehicle = vehiclesMap[newValue];
	});


	function refreshVehicles() {
		console.log("CALL   refreshVehicles()");
		var url = 'http://webservices.nextbus.com/service/publicXMLFeed?' +
			'command=vehicleLocations&a=sf-muni&t=' + vehicleLocationsLastUpdated;

		vehicleLocationsLastUpdated = (new Date()).getTime();
		// FIXME: d3.js shouldn't be used here. Use $http.
		d3.xml(url, function(error, response) {
			if (!$scope.vehicleRefreshEnabled) return;

			$scope.$apply(function() {
				var vehicleElems = response.documentElement.getElementsByTagName('vehicle');
				for (var i = 0; i < vehicleElems.length; i++) {
					var vehicleElem = vehicleElems[i];
					var vehicleId = Number(vehicleElem.attributes.getNamedItem('id').nodeValue);
					if (vehiclesMap[vehicleId] == null) {
						v = {
							id: vehicleId,
							lonLat: null,
							history: []
						};
						vehiclesMap[vehicleId] = v;
						$scope.vehicles.push(v);
					}
					else {
						v = vehiclesMap[vehicleId];
					}

					// FIXME: Not doing anything with this data at the moment.
					// Keep a short history of locations.
					if (v.lonLat) {
						v.history.unshift({t: vehicleLocationsLastUpdated, lonLat: v.lonLat});
						if (v.history.length > 10) {
							v.history.pop();
						}
					}

					v.lonLat = [
						Number(vehicleElem.attributes.getNamedItem('lon').nodeValue),
						Number(vehicleElem.attributes.getNamedItem('lat').nodeValue)
					];

					v.speed = Number(vehicleElem.attributes.getNamedItem('speedKmHr').nodeValue);
					v.reportDelay = Number(vehicleElem.attributes.getNamedItem('secsSinceReport').nodeValue);
				}
			});

			vehicleRefreshTimeoutId = setTimeout(refreshVehicles, $scope.vehicleRefreshInterval);
		});
	}

	
	$http.get('assets/data/arteries.json').success(function(response) {
		$scope.arteries = response.features;
	});
	$http.get('assets/data/freeways.json').success(function(response) {
		$scope.freeways = response.features;
	});
	/*
	$http.get('assets/data/neighborhoods.json').success(function(response) {
		$scope.neighborhoods = response.features;
	});
	$http.get('assets/data/streets.json').success(function(response) {
		$scope.streets = response.features;
	});
	*/

	refreshVehicles();
})

;

