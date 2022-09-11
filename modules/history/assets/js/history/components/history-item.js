import { STATUS_NOT_APPLIED } from '../hooks/use-document-history';

export default function HistoryItem( props ) {
	return (
		<div
			className={ `elementor-history-item elementor-history-item-${ props.status } ${ props.isCurrent ? 'elementor-history-item-current' : '' }` }
			onClick={ props.onClick }
		>
			<div className="elementor-history-item__details">
				<span className="elementor-history-item__title">{ props.title }</span>{ ' ' }
				<span className="elementor-history-item__subtitle">{ props.subTitle }</span>{ ' ' }
				<span className="elementor-history-item__action">{ props.action }</span>
			</div>

			<div className="elementor-history-item__icon">
				<span className="eicon" aria-hidden="true"></span>
			</div>
		</div>
	);
}

HistoryItem.propTypes = {
	isCurrent: PropTypes.bool,
	status: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	subTitle: PropTypes.string.isRequired,
	action: PropTypes.string.isRequired,
	onClick: PropTypes.func,
};

HistoryItem.defaultProps = {
	isCurrent: false,
	status: STATUS_NOT_APPLIED,
	title: '',
	subTitle: '',
	action: '',
	onClick: () => {},
};
