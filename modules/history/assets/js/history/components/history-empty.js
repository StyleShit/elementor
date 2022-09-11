export default function HistoryEmpty() {
	return (
		<div id="elementor-panel-history-no-items">

			<img className="elementor-nerd-box-icon" src={ `${ elementorAppConfig.assets_url }/images/information.svg` } />

			<div className="elementor-nerd-box-title">
				{ __( 'No History Yet', 'elementor' ) }
			</div>

			<div className="elementor-nerd-box-message">
				{ __( 'Once you start working, you\'ll be able to redo / undo any action you make in the editor.', 'elementor' ) }
			</div>

		</div>
	);
}
