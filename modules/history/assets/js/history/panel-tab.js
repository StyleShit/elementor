import HistoryTab from './components/history-tab';

export default class extends Marionette.CompositeView {
	id() {
		return 'e-panel-history';
	}

	template() {
		return '<div></div>';
	}

	render() {
		ReactDOM.render(
			<HistoryTab />,
			this.$el[ 0 ],
		);
	}

	onDestroy() {
		ReactDOM.unmountComponentAtNode( this.$el[ 0 ] );
	}
}
