<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Micropolis_Settings {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
		add_action( 'wp_ajax_micropolis_check_slug', array( $this, 'ajax_check_slug' ) );
	}

	public function add_menu() {
		add_options_page(
			'Micropolis',
			'Micropolis',
			'manage_options',
			'micropolis',
			array( $this, 'render_page' )
		);
	}

	public function enqueue_admin_assets( $hook ) {
		if ( $hook !== 'settings_page_micropolis' ) return;
		wp_enqueue_style( 'micropolis-admin', MICROPOLIS_URL . 'assets/css/admin.css', array(), MICROPOLIS_VERSION );
		wp_enqueue_script( 'micropolis-admin', MICROPOLIS_URL . 'assets/js/admin.js', array( 'jquery' ), MICROPOLIS_VERSION, true );
		wp_localize_script( 'micropolis-admin', 'micropolisAdmin', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'micropolis_admin' ),
		) );
	}

	public function render_page() {
		if ( isset( $_POST['micropolis_save'] ) && check_admin_referer( 'micropolis_settings' ) ) {
			$this->save_settings();
		}

		$languages = get_option( 'micropolis_languages', array() );
		?>
		<div class="wrap">
			<h1>Micropolis — Language Switcher</h1>
			<form method="post">
				<?php wp_nonce_field( 'micropolis_settings' ); ?>

				<table class="widefat micropolis-table" id="micropolis-languages">
					<thead>
						<tr>
							<th>Flag</th>
							<th>Language Code</th>
							<th>Page Slug</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $languages as $i => $lang ) : ?>
							<tr>
								<td class="micropolis-flag-cell">
									<span class="micropolis-flag"><?php echo esc_html( $this->code_to_flag( $lang['code'] ) ); ?></span>
								</td>
								<td>
									<input type="text" name="micropolis_lang[<?php echo $i; ?>][code]"
									       value="<?php echo esc_attr( $lang['code'] ); ?>"
									       maxlength="5" class="micropolis-code" placeholder="de" />
								</td>
								<td>
									<input type="text" name="micropolis_lang[<?php echo $i; ?>][slug]"
									       value="<?php echo esc_attr( $lang['slug'] ); ?>"
									       class="micropolis-slug regular-text" placeholder="page-slug" />
								</td>
								<td class="micropolis-status"></td>
								<td>
									<button type="button" class="button micropolis-remove" title="Remove">&times;</button>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>

				<p>
					<button type="button" class="button" id="micropolis-add-row">+ Add Language</button>
				</p>

				<p class="submit">
					<input type="submit" name="micropolis_save" class="button-primary" value="Save Settings" />
				</p>
			</form>
		</div>
		<?php
	}

	private function save_settings() {
		$raw = isset( $_POST['micropolis_lang'] ) ? $_POST['micropolis_lang'] : array();
		$languages = array();

		foreach ( $raw as $entry ) {
			$code = sanitize_text_field( trim( $entry['code'] ?? '' ) );
			$slug = sanitize_title( trim( $entry['slug'] ?? '' ) );
			if ( $code === '' ) continue;
			$languages[] = array( 'code' => strtolower( $code ), 'slug' => $slug );
		}

		update_option( 'micropolis_languages', $languages );
		add_settings_error( 'micropolis', 'saved', 'Settings saved.', 'updated' );
	}

	public function ajax_check_slug() {
		if ( ! check_ajax_referer( 'micropolis_admin', 'nonce', false ) ) {
			wp_send_json_error( 'Invalid nonce' );
		}
		$slug = sanitize_title( $_POST['slug'] ?? '' );

		if ( $slug === '' || $slug === '/' ) {
			wp_send_json_success( array( 'exists' => true, 'title' => 'Homepage' ) );
		}

		$page = get_page_by_path( $slug );
		if ( $page && $page->post_status === 'publish' ) {
			wp_send_json_success( array( 'exists' => true, 'title' => $page->post_title ) );
		}

		wp_send_json_success( array( 'exists' => false ) );
	}

	/**
	 * Convert a 2-letter country/language code to a flag emoji.
	 */
	public static function code_to_flag( $code ) {
		$code = strtolower( trim( $code ) );
		// Map language codes to country codes for flags
		$map = array(
			'de' => 'de', 'en' => 'gb', 'fr' => 'fr', 'es' => 'es',
			'it' => 'it', 'pt' => 'pt', 'nl' => 'nl', 'pl' => 'pl',
			'cs' => 'cz', 'sk' => 'sk', 'hu' => 'hu', 'ro' => 'ro',
			'bg' => 'bg', 'hr' => 'hr', 'sl' => 'si', 'sr' => 'rs',
			'bs' => 'ba', 'tr' => 'tr', 'ar' => 'sa', 'zh' => 'cn',
			'ja' => 'jp', 'ko' => 'kr', 'ru' => 'ru', 'uk' => 'ua',
			'sv' => 'se', 'da' => 'dk', 'fi' => 'fi', 'no' => 'no',
			'el' => 'gr',
		);
		$country = $map[ $code ] ?? $code;
		if ( strlen( $country ) !== 2 ) return '🌐';
		// Regional indicator symbols
		$flag = mb_chr( 0x1F1E6 + ord( $country[0] ) - ord( 'a' ) )
		      . mb_chr( 0x1F1E6 + ord( $country[1] ) - ord( 'a' ) );
		return $flag;
	}
}
