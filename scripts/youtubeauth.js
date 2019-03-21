var OAUTH2_CLIENT_ID = '195625735418-1ck471efn42p39l0aeuumf5c965ppuno.apps.googleusercontent.com';
    var OAUTH2_SCOPES = ['https://www.googleapis.com/auth/youtube'];
    googleApiClientReady = function() {
      gapi.auth.init(function() {
        window.setTimeout(checkAuth, 1);
      });
    }

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
    function checkAuth() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: true
      }, handleAuthResult);
    }


    //upload start
    var signinCallback = function (result){
      if(result.access_token) {
        var uploadVideo = new UploadVideo();
        uploadVideo.ready(result.access_token);
      }
    };

    var UploadVideo = function() {
      /**
       * The array of tags for the new YouTube video.
       *
       * @attribute tags
       * @type Array.<string>
       * @default ['google-cors-upload']
       */
      this.tags = ['youtube-cors-upload'];

      /**
       * The numeric YouTube
       * [category id](https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videoCategories.list?part=snippet®ionCode=us).
       *
       * @attribute categoryId
       * @type number
       * @default 22
       */
      this.categoryId = 22;

      /**
       * The id of the new video.
       *
       * @attribute videoId
       * @type string
       * @default ''
       */
      this.videoId = '';

      this.uploadStartTime = 0;
    };