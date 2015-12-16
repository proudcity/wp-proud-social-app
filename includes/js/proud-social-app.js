
(function($, Proud) {
  Proud.behaviors.proud_social_app = {
    attach: function(context, settings) {
      var instances = _.get(settings, 'proud_social_app.instances');
      if (instances) {
        $.each(instances, function(id, appVals) {
          var $app = $('#' + id);
          if(!$app.hasClass('ng-scope')) {
            angular.bootstrap($app, ['socialAppParent']);
          }
        });
      }
    }
  };
})(jQuery, Proud);