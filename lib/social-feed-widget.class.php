<?php
/**
 * @author James Laffert
 */

class SocialFeed extends WP_Widget {

  // proud libraries
  public static $libaries;

  function __construct() {
    parent::__construct(
      'proud_social_widget', // Base ID
      __( 'Social feed', 'wp-proud-social-app' ), // Name
      array( 'description' => __( 'Dynamic social media feed', 'wp-proud-social-app' ), ) // Args
    );

    // Init proud library on plugins loaded
    add_action( 'init', [$this,'registerLibraries'] );
    // Enqueue local frontend
    add_action('wp_enqueue_scripts', array($this,'enqueueFrontend'));
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
  public function widget( $args, $instance ) {

    $conf = [
      'accounts' => NULL,
      'agency' => NULL,
      'custom' => NULL,
      'services' => ['facebook','twitter','instagram','youtube'],
      'widget_type' => 'wall',
      'post_count' => 20,
      'show_controls' => TRUE,
    ];

    $app_id = 'social-app';

    // Compile html into a url encoded string
    $lazy_html = rawurlencode(
      '<div social-' . $conf['widget_type'] 
      . ' social-post-count="' . $conf['post_count'] . '"'
      . ( $conf['hide_controls'] ? '" social-hide-controls="true"' : '' )
      . ( $conf['widget_type'] == 'static' ? '" social-static-cols="1"' : '' )
      . '></div>');
    ?>
    <div id="<?php print $app_id; ?>">
      <div in-view="socialCompile = socialCompile || '<?php print $lazy_html; ?>'"
           lazy-compile="socialCompile" lazy-decode="true"></div>
    </div>
    <?php
  }

  /**
   * Back-end widget form.
   *
   * @see WP_Widget::form()
   *
   * @param array $instance Previously saved values from database.
   */
  public function form( $instance ) {
    $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'New title', 'wp-proud-social-app' );
    ?>
    <p>
    <label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label> 
    <input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
    </p>
    <?php 
  }

  /**
   * Sanitize widget form values as they are saved.
   *
   * @see WP_Widget::update()
   *
   * @param array $new_instance Values just sent to be saved.
   * @param array $old_instance Previously saved values from database.
   *
   * @return array Updated safe values to be saved.
   */
  public function update( $new_instance, $old_instance ) {
    $instance = array();
    $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';

    return $instance;
  }
}

// register Foo_Widget widget
function register_social_feed_widget() {
  register_widget( 'SocialFeed' );

}
add_action( 'widgets_init', 'register_social_feed_widget' );