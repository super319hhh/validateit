var app = angular.module('validateItUserPortalApp');

// app.controller('CustomModalCtrl', ['$scope', 'close', function($scope, close, modalText) {
app.controller('dialogCtrl', function($scope, $rootScope, close, data) {
	$scope.data = data;
	$scope.delay = 100;
	$scope.buttons = {
		custom: {
			buttonText: "OK",
			class: "btn-default",
			show: false,
			noClickFnc: "",
			inputs: [],
		},
		cancel: {
			buttonText: "Cancel",
			class: "btn-default",
			show: true,
			noClickFnc: "",
			inputs: [],
		}

	}
	if(!$scope.data.hasOwnProperty('modalTextClass')){
		$scope.data.modalTextClass = "";
	}
	if($scope.data.hasOwnProperty('autoClose')){
		if($scope.data.autoClose===true){
			var delay = 0;
			if($scope.data.hasOwnProperty('closingDelay')){
				delay = $scope.data.closingDelay;
			}
			$scope.delay = delay;
			close({
				result: "closed",
			}, $scope.delay);
		}
	}
	if($scope.data.hasOwnProperty('buttons')){
		if($scope.data.buttons.hasOwnProperty('custom')){
			$scope.buttons.custom.buttonText = $scope.data.buttons.custom.hasOwnProperty("buttonText") ? $scope.data.buttons.custom.buttonText: "OK";
			$scope.buttons.custom.show = $scope.data.buttons.custom.hasOwnProperty("show") ? $scope.data.buttons.custom.show: false;
			$scope.buttons.custom.noClickFnc = $scope.data.buttons.custom.hasOwnProperty("noClickFnc") ? $scope.data.buttons.custom.noClickFnc: "";
			$scope.buttons.custom.inputs = $scope.data.buttons.custom.hasOwnProperty("inputs") ? $scope.data.buttons.custom.inputs: [];
			$scope.buttons.custom.class = $scope.data.buttons.custom.hasOwnProperty("class") ? $scope.data.buttons.custom.class: "btn-primary";
		}
		if($scope.data.buttons.hasOwnProperty('cancel')){
			$scope.buttons.cancel.buttonText = $scope.data.buttons.cancel.hasOwnProperty("buttonText") ? $scope.data.buttons.cancel.buttonText: "Cancel";
			$scope.buttons.cancel.show = $scope.data.buttons.cancel.hasOwnProperty("show") ? $scope.data.buttons.cancel.show: false;
			$scope.buttons.cancel.noClickFnc = $scope.data.buttons.cancel.hasOwnProperty("noClickFnc") ? $scope.data.buttons.cancel.noClickFnc: "";
			$scope.buttons.cancel.inputs = $scope.data.buttons.cancel.hasOwnProperty("inputs") ? $scope.data.buttons.cancel.inputs: [];
			$scope.buttons.cancel.class = $scope.data.buttons.cancel.hasOwnProperty("class") ? $scope.data.buttons.cancel.class: "btn-default";
		}
	}

	$scope.customBtnOnClick = function(){
		var retObj = {
			result: "success"
		};
		if($scope.buttons.custom.noClickFnc!="" && $scope.buttons.custom.noClickFnc != null){
			retObj.noClickFnc = $scope.buttons.custom.noClickFnc;
		}
		if($scope.buttons.custom.inputs!="" && $scope.buttons.custom.inputs != null){
			if($scope.buttons.custom.inputs.length>0){
				retObj.inputs = $scope.buttons.custom.inputs;
			}
		}
		close(retObj, $scope.delay);
	}

	$scope.closeModal = function(){
		var retObj = {
			result: "success"
		};
		if($scope.buttons.cancel.noClickFnc!="" && $scope.buttons.cancel.noClickFnc != null){
			retObj.noClickFnc = $scope.buttons.cancel.noClickFnc;
		}
		if($scope.buttons.cancel.inputs!="" && $scope.buttons.cancel.inputs != null){
			if($scope.buttons.cancel.inputs.length>0){
				retObj.inputs = $scope.buttons.cancel.inputs;
			}
		}
		close(retObj, $scope.delay);
	}

	//  This close function doesn't need to use jQuery or bootstrap, because
	//  the button has the 'data-dismiss' attribute.
	$scope.close = function() {
		close({
			result: "cancel",
		}, $scope.delay); // close, but give 500ms for bootstrap to animate
	};

	//  This cancel function must use the bootstrap, 'modal' function because
	//  the doesn't have the 'data-dismiss' attribute.
	$scope.delete = function() {

		//  Manually hide the modal.

		//  Now call close, returning control to the caller.
		close({
			result: "delete",
		}, $scope.delay); // close, but give 500ms for bootstrap to animate
	};

	//  This cancel function must use the bootstrap, 'modal' function because
	//  the doesn't have the 'data-dismiss' attribute.
	$scope.select = function(text) {

		//  Manually hide the modal.

		//  Now call close, returning control to the caller.
		close({
			result: text,
		}, $scope.delay); // close, but give 500ms for bootstrap to animate
	};
});