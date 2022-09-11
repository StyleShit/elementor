import useDocumentHistory from '../hooks/use-document-history';
import HistoryEmpty from './history-empty';
import HistoryListView from 'elementor/modules/history/assets/js/history/components/history-list-view';

export default function HistoryTab() {
	const { items, currentItem, applyItem } = useDocumentHistory(),
		isEmpty = ( 0 === items.length );

	return (
		<div id="elementor-panel-history" className={ isEmpty ? 'elementor-empty' : '' }>
			<div id="elementor-history-list">
				{ isEmpty
					? <HistoryEmpty />
					: <HistoryListView
							items={ items }
							onItemClick={ applyItem }
							currentItem={ currentItem }
					/>
				}
			</div>

			<div className="elementor-history-revisions-message">
				{ __( 'Switch to Revisions tab for older versions', 'elementor' ) }
			</div>
		</div>
	);
}
