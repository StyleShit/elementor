import HistoryItem from './history-item';

export default function HistoryListView( props ) {
	return (
		<>
			{
				props.items.map( ( item, i ) =>
					<HistoryItem
						key={ item.id }
						id={ item.id }
						title={ item.title }
						subTitle={ item.subTitle }
						action={ item.action }
						status={ item.status }
						isCurrent={ i === props.currentItem }
						onClick={ () => props.onItemClick( i ) }
					/>,
				)
			}
		</>
	);
}

HistoryListView.propTypes = {
	items: PropTypes.array.isRequired,
	currentItem: PropTypes.number.isRequired,
	onItemClick: PropTypes.func.isRequired,
};

HistoryListView.defaulProps = {
	items: [],
	currentItem: -1,
	onItemClick: () => {},
};
