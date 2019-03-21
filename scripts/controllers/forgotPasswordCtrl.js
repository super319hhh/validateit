'use strict';

angular.module('validateItUserPortalApp')
	.controller('forgotPasswordCtrl', ['$scope', '$window', '$location', '$modal', '$log', 'httpServerService', 'ModalService', function($scope, $window, $location, $modal, $log, httpServerService, ModalService) {
		$scope.emailInput = '';
		$scope.forgotPasswordError = false;
		$scope.modalText = "Instruction to get back the password has been sent to the registered email address.";
		$scope.animationsEnabled = true;

		$scope.sendNewPassword = function() {
			$scope.forgotPasswordError = false;
			console.log(" -- New Password Request --");
			//return ;
			NProgress.start();

			if (typeof $scope.emailInput === 'undefined') {
				$scope.forgotPasswordError = true;
				$scope.forgotPasswordErrorMsg = "Please enter a valid email address";
				NProgress.done();
				return null;
			}

			var url = "forgotPassword";
			var uploadData = {
				email: $scope.emailInput
			};

			httpServerService.makeHttpRequest(url, "post", uploadData)
				.then(function(response) {
					if (response.status == 200) {
						console.log("---- New Password Sent Successfully ----");
						// var redirectTo = '/login';
						NProgress.done();
						$scope.openModal();
						// $location.path(redirectTo);
					} else if (response.status == 401) {
						console.log("---- New Password Sent Failed: Email not registered ----");
						$scope.forgotPasswordError = true;
						$scope.forgotPasswordErrorMsg = "The email address you enter is not registered.";
						NProgress.done();
					} else {
						console.log("---- New Password Sent Failed: Server error ----");
						$scope.forgotPasswordError = true;
						$scope.forgotPasswordErrorMsg = "Server error. We cannot process your request at the moment.";
						NProgress.done();
					}
				})
		}

		$scope.openModal = function() {
			ModalService.showModal({
				templateUrl: "views/modal_templates/notification.html",
				controller: "dialogCtrl",
				inputs: {
					data: {
						modalTitle: "",
						modalText: $scope.modalText,
						autoClose: true,
						closingDelay: 10000
					}
				},
			}).then(function(modal) {
				modal.close.then(function(result) {
					console.log(result);
					if (result.result === 'cancel') {
						$window.location.assign('/#/login');
					} else {

					}
				});
			});
		};
	}]);