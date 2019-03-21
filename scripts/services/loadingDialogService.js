var app = angular.module('validateItUserPortalApp');
app.service('loadingDialogService', ['$timeout', function($timeout) {
	// var pleaseWaitDiv = $('<div class="modal fade" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="padding-left:15px"><span style="font-size:16px">' + text + '</span></div><div class="modal-body"><div class="progress" style="margin:10px 0;"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">100% Complete (success)</span></div></div></div>');
	var pleaseWaitDiv = function(text,percentage) {
		if(percentage===undefined || percentage===null || percentage == ''){
			return $('<div class="modal fade" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="padding-left: 15px;line-height: 38px;font-size: 16px;">' + text + '</div><div class="modal-body"><div class="progress" style="margin:10px 0; width: 100%;"><div class="progress-bar progress-bar-striped active" id="progressPercentage" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">100% Complete (success)</span></div></div></div>');
		}else{
			return $('<div class="modal fade" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="padding-left: 15px;line-height: 38px;font-size: 16px;">' + text + '</div><div class="modal-body"><div class="progress" style="margin:10px 0; width: 100%;"><div class="progress-bar progress-bar-striped active" id="progressPercentage" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style=""><span class="sr-only">100% Complete (success)</span></div></div></div>');
		}
	};

	var defaultErrorMsg = function(text){
		return $('<div class="modal fade" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="padding-left: 15px;line-height: 38px;font-size: 16px;">Oops !</div><div class="modal-body"><div style="font-size: 16px;padding: 5px 10px 20px 5px;color: #a94442;">'+text+'</div></div>');
	}

	var ProcessingDiv;
	var uploadingDiv;

	this.showProcessingPleaseWait = function(text) {
		ProcessingDiv = ProcessingDiv || pleaseWaitDiv(text);
		ProcessingDiv.modal();
	};
	this.hideProcessingPleaseWait = function() {
		if (ProcessingDiv) {
			ProcessingDiv.modal('hide');
		}
		/* Fix "modal-backdrop doesn't disappear after modal dialog disppear */
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
		/*  ---------------------------------------------------------------- */
		$('#pleaseWaitDialog').remove();
		ProcessingDiv = null;
	};
	this.showDefaultErrorMessage = function(text, autohide,timer){
		ProcessingDiv = ProcessingDiv || defaultErrorMsg(text);
		ProcessingDiv.modal();
		if(typeof(autohide) != 'undefined' && autohide != null){
			if(autohide===true){
				if(typeof(timer) != 'undefined' && timer != null){
					if(isNaN(timer)){
						timer = 10000;
					}
				}else{
					timer = 10000;
				}

				$timeout(function() {
					if (ProcessingDiv) {
						ProcessingDiv.modal('hide');
					}
					/* Fix "modal-backdrop doesn't disappear after modal dialog disppear */
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					/*  ---------------------------------------------------------------- */
					$('#pleaseWaitDialog').remove();
					ProcessingDiv = null;
				}, timer);
			}
		}
	};
	this.hideDefaultErrorMessage = function(){
		if (ProcessingDiv) {
			ProcessingDiv.modal('hide');
		}
		/* Fix "modal-backdrop doesn't disappear after modal dialog disppear */
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
		/*  ---------------------------------------------------------------- */
		$('#pleaseWaitDialog').remove();
		ProcessingDiv = null;
	};
	this.showUploadingPleaseWait = function(text,percentage) {
		uploadingDiv = uploadingDiv || pleaseWaitDiv(text,percentage);
		uploadingDiv.modal();
	};
	this.hideUploadingPleaseWait = function() {
		if (uploadingDiv) {
			uploadingDiv.modal('hide');
		}
		/* Fix "modal-backdrop doesn't disappear after modal dialog disppear */
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
		/*  ---------------------------------------------------------------- */
		$('#pleaseWaitDialog').remove();
		uploadingDiv = null;
	};

	/* *
	 * Method: autoSaveNotification
	 * Parameters: type = { true: show notification, false: hide notification }
	 * Description: this method will add/remove an notification on auto save project.
	 * */
	this.autoSaveNotification = function(type){
		//console.log("------> Auto Save Notification: "+type);
		var addAnimClass = "", removeAnimClass = "";
		if(type===true){ // in
			addAnimClass = "bounceInDown ";
			removeAnimClass = "bounceOutUp ";
		}else{ // out
			addAnimClass = "bounceOutUp ";
			removeAnimClass = "bounceInDown ";
		}
		if(document.getElementById("auto-save-wrapper")!= null){
			var delay = 0;
			if(addAnimClass=="bounceOutUp "){
				delay = 2200;
			}
			$timeout(function() {
				$("body").find("#auto-save-wrapper").removeClass(removeAnimClass).addClass(addAnimClass);
			}, delay);

		}else{
			$("body").append('<div id="auto-save-wrapper" class="'+addAnimClass+' animated"><div class="content">Saving ...</div></div>');
		}
	};
}]);