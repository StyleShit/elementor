import { useEffect, useState, useCallback } from 'react';

export const STATUS_APPLIED = 'applied';
export const STATUS_NOT_APPLIED = 'not_applied';

/**
 * Hook to use the current document history.
 *
 * @return {{applyItem: (function(*): void), items: *[], currentItem: number}}
 */
export default function useDocumentHistory() {
	const { history } = elementor.documents.getCurrent();

	const [ items, setItems ] = useState( history.getItems().toJSON() ),
		currentItem = items.findIndex( ( item ) => STATUS_NOT_APPLIED === item.status );

	// Sync the local state with the global history collection.
	// TODO: Move to React 18 and use `useSyncExternalStore()`.
	useEffect( () => {
		const onHistoryUpdate = ( newItems ) => setItems( newItems.toJSON() );

		history.on( 'update', onHistoryUpdate );

		return () => {
			history.off( 'update', onHistoryUpdate );
		};
	}, [] );

	const applyItem = useCallback( ( index ) => {
		$e.run( 'panel/history/actions/do', { index } );
	}, [] );

	return {
		items,
		currentItem,
		applyItem,
	};
}
