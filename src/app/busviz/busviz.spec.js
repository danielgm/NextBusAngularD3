
describe('bus visualization', function() {
	var scope, controller, $httpBackend;

	beforeEach(module('ngBoilerplate.busviz'));
	beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
		$httpBackend = _$httpBackend_;

		$httpBackend.expectGET('assets/data/arteries.json').respond({
			type: 'FeatureCollection',
			features: [
				{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [ [ -122.397385538782686, 37.78255359294009, 0.0 ], [ -122.396841427361665, 37.782119121564392, 0.0 ] ] } },
				{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [ [ -122.396841427361665, 37.782119121564392, 0.0 ], [ -122.396379519146748, 37.78175028375869, 0.0 ] ] } },
				{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [ [ -122.396379519146748, 37.78175028375869, 0.0 ], [ -122.395843499031031, 37.781321257156094, 0.0 ] ] } },
				{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [ [ -122.395843499031031, 37.781321257156094, 0.0 ], [ -122.39551775271012, 37.781062140692875, 0.0 ] ] } },
				{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [ [ -122.39551775271012, 37.781062140692875, 0.0 ], [ -122.395064951875938, 37.780700560311118, 0.0 ] ] } }
			]
		});

		$httpBackend.expectGET('assets/data/freeways.json').respond('response2');

		scope = $rootScope.$new();
		controller = $controller('BusVizCtrl', {$scope: scope});
	}));

	it('should start in normal display mode', function() {
		expect(scope.vehicleDisplayMode).toBe('normal');
	});

	it('should load arteries from backend', function() {
		expect(scope.arteries.length).toBe(0);
		$httpBackend.flush();
		expect(scope.arteries.length).toBe(5);
	});
});

