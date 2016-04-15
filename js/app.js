;(function () {

	'use strict';

	var module = angular.module('app', ['ui.router']);

	module.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {


		$urlRouterProvider.otherwise('/')

		$stateProvider
			.state('main', {
				url: '/',
				templateUrl: 'partials/main.html',
				controller: 'MainCtrl'
			})
			.state('deputados', {
				url: '/deputados/:nome',
				templateUrl: 'partials/deputados.html',
				controller: 'DeputadosCtrl'
			})
			.state('estados', {
				url: '/estados/:estado',
				templateUrl: 'partials/estados.html',
				controller: 'EstadoCtrl'
			});


	}]);


	module.service('ResultadoRepository', ['$q', '$http', function ($q, $http) {

		var cache;
			
		this.findAll = function () {
			if (cache) {
				return $q.when(cache);
			}
			var defer = $q.defer();
			$http.jsonp('http://www1.folha.uol.com.br/interacoes/2016/04/congresso/chamber_impeachment_full.json?_=1460691402439');
			window.scores = function (response) {
				cache = response;
				defer.resolve(response);
			};
			return defer.promise;
		}

	}]);

	module.controller('MainCtrl', ['$scope', 'EstadosRepository', 'ResultadoRepository', '$state', '$location',
	 function ($scope, EstadosRepository, ResultadoRepository, $state, $location) {

	 	$scope.url = $location.$$absUrl;

		var estado = localStorage.getItem('estado');
		$scope.estados = EstadosRepository.findAll();
		
		$scope.filtro = {
			favor: true,
			contra: true,
			naoOpinou: true,
			estado: undefined
		};

		$scope.alterarEstado = function (estado) {
			$state.go('estados', { estado: $scope.filtro.estado.id });
		};

		if (!estado) {
			$scope.exibirSelecaoEstado = true;
		}

		ResultadoRepository.findAll()
			.then(function (resultado) {
				$scope.resultado = resultado; 
				$scope.resultado.info.updated = $scope.resultado.info.updated.split('-').join('/');
			});

		$scope.exibir = function (polict) {
			if (polict.trend == 'yes') return $scope.filtro.favor;
			if (polict.trend == 'no') return $scope.filtro.contra;
			return $scope.filtro.naoOpinou;
		};

		$scope.compartilhar = function (polict) {
			$state.go('deputados', {nome: polict.name.split(' ').join('-')});
		}

	}]);


	module.controller('DeputadosCtrl', ['$scope', 'EstadosRepository', 'ResultadoRepository',  '$stateParams', '$location', '$state',

	 function ($scope, EstadosRepository, ResultadoRepository, $stateParams, $location, $state) {

	 	if (!$stateParams.nome) {
	 		$state.go('main');
	 		return;
	 	}

	 	$scope.url = $location.$$absUrl;
	 	var nome = $stateParams.nome.split('-').join(' ');

	 	ResultadoRepository.findAll().then(function (response) {
	 		for (var i=0; i < response.politics.length; i++) {
	 			if (response.politics[i].name == nome) {
	 				$scope.polict = response.politics[i];
	 				break;
	 			}
	 		}
	 	});
		
	}]);


	module.controller('EstadoCtrl', ['$scope', 'EstadosRepository', 'ResultadoRepository',  '$stateParams', '$location', '$state',

	 function ($scope, EstadosRepository, ResultadoRepository, $stateParams, $location, $state) {

	 	if (!$stateParams.estado) {
	 		$state.go('main');
	 		return;
	 	}


		$scope.totalAFavor = 0;
		$scope.totalContra = 0;
		$scope.totalOutros = 0;


	 	$scope.alterarEstado = function (estado) {
			$state.go('estados', { estado: $scope.filtro.estado.id });
		};

	 	$scope.url = $location.$$absUrl;
	 	var estado = $stateParams.estado;

	 	$scope.politics = [];

	 	ResultadoRepository.findAll().then(function (response) {
	 		for (var i=0; i < response.politics.length; i++) {
	 			if (response.politics[i].state.toLowerCase() == estado.toLowerCase()) {
	 				if (response.politics[i].trend == 'yes') {
	 					$scope.totalAFavor++;
	 				} else if (response.politics[i].trend == 'no') {
	 					$scope.totalContra++;
	 				} else {
	 					$scope.totalOutros++;
	 				}
	 				$scope.politics.push(response.politics[i]);
	 			}
	 		}
	 	});

	 	var estados = EstadosRepository.findAll();
	 	$scope.estados = estados;
	 	for (var i=0; i < estados.length; i++) {
	 		if (estados[i].id == estado.toLowerCase()) {
	 			$scope.estado = estados[i];
	 			break;
	 		}
	 		
	 	}

	 	if (!$scope.estado) {
	 			$state.go('main');
	 			return;
	 		}

	 	$scope.exibir = function (polict) {
			if (polict.trend == 'yes') return $scope.filtro.favor;
			if (polict.trend == 'no') return $scope.filtro.contra;
			return $scope.filtro.naoOpinou;
		};

		$scope.filtro = {
			favor: true,
			contra: true,
			naoOpinou: true,
			estado: $scope.estado
		};

		$scope.compartilhar = function (polict) {
			$state.go('deputados', {nome: polict.name.split(' ').join('-')});
		}
		
	}]);




	module.service('EstadosRepository', [function () {

		this.findAll =  function () {
			return [
				{ nome: 'Acre', id: 'ac' },
				{ nome: 'Alagoas', id: 'al' },
				{ nome: 'Amapá', id: 'ap' },
				{ nome: 'Amazonas', id: 'am' },
				{ nome: 'Bahia', id: 'ba' },
				{ nome: 'Ceará', id: 'ce' },
				{ nome: 'Distrito Federal', id: 'df' },
				{ nome: 'Espírito Santo', id: 'es' },
				{ nome: 'Goiás', id: 'go' },
				{ nome: 'Maranhão', id: 'ma' },
				{ nome: 'Mato Grosso', id: 'mt' },
				{ nome: 'Mato Grosso do Sul', id: 'ms' },
				{ nome: 'Minas Gerais', id: 'mg' },
				{ nome: 'Paraíba', id: 'pb' },
				{ nome: 'Paraná', id: 'pr' },
				{ nome: 'Pernambuco', id: 'pe' },
				{ nome: 'Piaú', id: 'pi' },
				{ nome: 'Rio de Janeiro', id: 'rj' },
				{ nome: 'Rio Grande do Norte', id: 'rn' },
				{ nome: 'Rio Grande do Sul', id: 'rs' },
				{ nome: 'Rondônia', id: 'ro' },
				{ nome: 'Roraima', id: 'rr' },
				{ nome: 'Santa Catarina', id: 'sc' },
				{ nome: 'São Paulo', id: 'sp' },
				{ nome: 'Sergipe', id: 'se' },
				{ nome: 'Tocantins', id: 'to' }
			];
		};

	}]);


})();