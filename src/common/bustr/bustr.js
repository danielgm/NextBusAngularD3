angular.module('bustr', [])
	.directive('bustr', function() {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				arteries: '=',
				freeways: '=',
				neighborhoods: '=',
				streets: '=',
				vehicles: '=',
				vehicleRefreshInterval: '=',
				vehicleDisplayMode: '=',
				selectedVehicleId: '='
			},
			link: function($scope, element, attrs) {
				var self = this;

				var chart = d3.select(element[0]);
				var width = 800, height = 600;
				var svg = chart.append('svg:svg')
					.attr('class', 'bustr')
					.attr('version', '1.1')
					.attr('width', width)
					.attr('height', height);

				var projection = d3.geo.mercator()
					.scale(250000)
					.center([-122.41942, 37.77493]);
				
				var path = d3.geo.path()
					.projection(projection);

				var reportDelayScaleSq = d3.scale.linear()
					.domain([0, 5 * 60])
					.range([0, 64]);

				var speedScaleSq = d3.scale.linear()
					.domain([0, 150])
					.range([0, 64]);

				var vehicleColorScale = d3.scale.category10();
				var vehiclePosition = function(d) {
					var coords = projection(d.lonLat);
					d3.select(this)
						.attr('cx', coords[0])
						.attr('cy', coords[1]);
				};

				svg.append('svg:g').attr('class', 'arteries');
				svg.append('svg:g').attr('class', 'freeways');
				svg.append('svg:g').attr('class', 'neighborhoods');
				svg.append('svg:g').attr('class', 'streets');
				svg.append('svg:g').attr('class', 'vehicles');
				svg.append('svg:g').attr('class', 'trails');

				$scope.$watch('arteries', function(newValue, oldValue) {
					svg.select('.arteries').selectAll('.artery')
							.data(newValue)
						.enter().append('svg:path')
							.attr('class', 'artery')
							.attr('d', path);
				});
				
				$scope.$watch('freeways', function(newValue, oldValue) {
					svg.select('.freeways').selectAll('.freeway')
							.data(newValue)
						.enter().append('svg:path')
							.attr('class', 'freeway')
							.attr('d', path);
				});
				
				$scope.$watch('neighborhoods', function(newValue, oldValue) {
					svg.select('.neighborhoods').selectAll('.neighborhood')
							.data(newValue)
						.enter().append('svg:path')
							.attr('class', 'neighborhood')
							.attr('d', path);
				});
				
				$scope.$watch('streets', function(newValue, oldValue) {
					svg.select('.streets').selectAll('.street')
							.data(newValue)
						.enter().append('svg:path')
							.attr('class', 'street')
							.attr('d', path);
				});

				$scope.$watch('vehicles', function(newValue, oldValue) {
					if (!newValue) return;
					redraw();
				}, true);

				$scope.$watch('vehicleDisplayMode', function(newValue, oldValue) {
					if (!newValue) return;
					console.log('vehicleDisplayMode', newValue, oldValue);
					redraw();
				});

				function redraw() {
					var s;

					s = svg.select('.vehicles').selectAll('.vehicle')
						.data($scope.vehicles, function(d) { return d.id; });

					s.exit().remove();

					s.transition()
						.duration($scope.vehicleRefreshInterval)
						.attr('cx', function(d) { return projection(d.lonLat)[0]; })
						.attr('cy', function(d) { return projection(d.lonLat)[1]; });

					s.enter().append('svg:circle')
						.attr('class', 'vehicle')
						.attr('cx', function(d) { return projection(d.lonLat)[0]; })
						.attr('cy', function(d) { return projection(d.lonLat)[1]; })
						.style('fill', function(d) { return vehicleColorScale(d.id % 10); })
						.on('click', function(d) {
							$scope.$apply(function() {
								$scope.selectedVehicleId = d.id;
							});
						});

					s.transition()
						.duration(500)
							.attr('r', function(d) {
								switch ($scope.vehicleDisplayMode) {
									case 'reportDelay': return Math.sqrt(reportDelayScaleSq(d.reportDelay));
									case 'speed': return Math.sqrt(speedScaleSq(d.speed));
									default: return 4;
								}
							});

					s.append('svg:title')
							.text(function(d) { return "Vehicle ID: " + d.id; });
				}
			}
		};
	});
