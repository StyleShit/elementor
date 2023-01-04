import { useEffect, useState } from 'react';
import { observe } from '@elementor/object-observer';
import { ObserversManager } from '@elementor/object-observer/src/observers-manager';

declare global {
	interface Window {
		elementor: {
			documents: {
				addEventListener: ( event: string, callback: () => any ) => () => void;
				getCurrent: () => object
			};
		};
	}
}

export function useDocuments() {
	const [ , setState ] = useState( {} );

	useEffect( () => {
		const reRender = () => setState( {} );

		new ObserversManager().add( 'elementor.documents.currentDocument.editor.isSaving', reRender );

		// observe( {
		// 	selector: 'elementor.documents.currentDocument.editor.isSaved',
		// 	keys: [ '*' ],
		// 	callback: ( batch ) => {
		// 		console.log( '@@@ batch', batch );
		// 	},
		// } );
	}, [] );

	return window.elementor.documents.getCurrent() || {};
}
