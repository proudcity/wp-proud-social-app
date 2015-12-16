<?php
/**
 * @author ProudCity
 */

use Proud\Core;

class SocialFeed extends Core\ProudWidget {

  // proud libraries
  public static $libaries;

  function __construct() {
    parent::__construct(
      'proud_social_app', // Base ID
      __( 'Social feed', 'wp-proud-social-app' ), // Name
      array( 'description' => __( 'Dynamic social media feed', 'wp-proud-social-app' ), ) // Args
    );
  }

  function initialize() {

    $services = array(
      'facebook'=> array('name' => 'Facebook', 'icon' => 'fa-facebook-square'),
      'twitter'=> array('name' => 'Twitter', 'icon' => 'fa-twitter-square'),
      'youtube'=> array('name' => 'Youtube', 'icon' => 'fa-youtube-play'),
      'instagram'=> array('name' => 'Instagram', 'icon' => 'fa-instagram'),
      'ical'=> array('name' => 'iCal', 'icon' => 'fa-calendar'),
      'rss'=> array('name' => 'RSS Feed', 'icon' => 'fa-rss')
    );
    $serviceOptions = array();
    foreach($services as $key => $service) {
      $serviceOptions[$key] = $service['name'];
    }

    $this->settings = [
      'services' => [
        '#type' => 'checkboxes',
        '#title' => 'Services',
        '#default_value' => array_keys($serviceOptions),
        '#description' => 'What social services should appear?',
        '#options' => $serviceOptions,
        '#to_js_settings' => true
      ],
      'hide_controls' => [
        '#type' => 'checkbox',
        '#title' => 'Hide Controls?',
        '#description' => 'Hide the service switcher toolbar?.',
        '#return_value' => '1',
        '#label_above' => true,
        '#replace_title' => 'Yes',
        '#default_value' => false,
        '#to_js_settings' => true
      ],
      'widget_type' => [
        '#type' => 'radios',
        '#title' => 'Widget type',
        '#description' => 'Choose between a static feed, animated social wall, and a timeline.',
        '#default_value' => 'static',
        '#options' => array(
          'static' => 'Feed',
          'wall' => 'Social wall',
          'timeline' => 'Timeline'
        )
      ],
      'post_count' => [
        '#type' => 'text',
        '#title' => 'Count',
        '#description' => 'How many items to show',
        '#default_value' => '20',
      ]
    ];
  }

  public function registerLibraries() {
    global $proudcore;
    $proudcore::$libraries->addAngular(true, false, true);
  }

  public function enqueueFrontend() {
    $path = plugins_url('../includes/js/',__FILE__);
    // Running script
    wp_enqueue_script('proud-social-app', $path . 'proud-social-app.js', array('angular'), false, true);
    // Angular resources
    $path .= 'proud-social-app/dist/';
    wp_enqueue_script('proud-social-app-libraries', $path . 'js/libraries.min.js', array('angular'), false, true);
    wp_enqueue_script('proud-social-app-app', $path . 'js/app.min.js', array('proud-social-app-libraries'), false, true);
    wp_enqueue_script('proud-social-app-templates', $path . 'views/app.templates.js', array('proud-social-app-app'), false, true);
  }

  /**
   * Front-end display of widget.
   *
   * @see WP_Widget::widget()
   *
   * @param array $args     Widget arguments.
   * @param array $instance Saved values from database.
   */
  public function printWidget( $args, $instance ) {
    $instance = $this->addSettingDefaults($instance);

    // Compile html into a url encoded string
    $lazy_html = rawurlencode(
      '<div social-' . $instance['widget_type'] 
      . ' social-post-count="' . $instance['post_count'] . '"'
      . ( $instance['hide_controls'] ? '" social-hide-controls="true"' : '' )
      . ( $instance['widget_type'] == 'static' ? '" social-static-cols="1"' : '' )
      . '></div>');
    ?>
    <div id="<?php print $this->id; ?>">
      <div ng-init="$root.appId = '<?php print $this->id; ?>'" in-view="socialCompile = socialCompile || '<?php print $lazy_html; ?>'"
           lazy-compile="socialCompile" lazy-decode="true"></div>
    </div>
    <?php
  }
}

// register Foo_Widget widget
function register_social_feed_widget() {
  register_widget( 'SocialFeed' );

}
add_action( 'widgets_init', 'register_social_feed_widget' );