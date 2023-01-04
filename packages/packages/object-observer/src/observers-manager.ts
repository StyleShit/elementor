import { ObjectObserver } from './object-observer';

export type Selector = string;

export type Path = string;

type Callback = ( data: {
	path: Path;
	value: any;
} ) => void;

type ObjectByPath = {
	key: string,
	object: Record<PropertyKey, any>,
	parent: Record<PropertyKey, any>,
};

export class ObserversManager {
	private callbacksBySelector: Record<Selector, Set<Callback>> = {};

	private observersByPath: Record<Path, ObjectObserver | null> = {};

	add( selector: Selector, callback: Callback ) {
		if ( ! this.callbacksBySelector[ selector ] ) {
			this.callbacksBySelector[ selector ] = new Set();
		}

		this.callbacksBySelector[ selector ].add( callback );

		const entry = selector.split( '.' ).shift();

		if ( entry ) {
			this.initObserver( entry );
		}

		console.log( this );
	}

	private initObserver( path: Path ) {
		this.revokeObserver( path );

		this.observersByPath[ path ] = this.makeObserver( path );
	}

	private revokeObserver( path: Path ) {
		if ( ! this.observersByPath[ path ] ) {
			return;
		}

		// TODO: WTF?
		this.observersByPath[ path ].revoke();

		const observedObject = this.getObjectByPath( path );

		if ( ! observedObject ) {
			return;
		}

		// observedObject.parent[ observedObject.key ] = this.observersByPath[ path ].getOriginalObject();

		this.observersByPath[ path ] = null;
	}

	private makeObserver( path: Path ) {
		const observedObject = this.getObjectByPath( path );

		if ( ! observedObject ) {
			return null;
		}

		const observer = new ObjectObserver( {
			object: observedObject.object,
			path,
			onChange: ( { path, property, value } ) => {
				const fullPath = [ path, property ].join( '.' );

				this.initSubsetsObservers( fullPath, value );
				this.runCallbacks( fullPath, value );
			},
		} );

		observedObject.parent[ observedObject.key ] = observer.getProxy();

		return observer;
	}

	private initSubsetsObservers( fullPath: string, value: any ) {
		if ( value && typeof value === 'object' ) {
			const isSubset = !! Object.keys( this.callbacksBySelector )
				.find( ( selector ) => selector.startsWith( fullPath ) && selector !== fullPath );

			if ( isSubset ) {
				this.initObserver( fullPath );
			}
		}
	}

	private runCallbacks( fullPath: string, value: any ) {
		const [ , callbacks ] = Object
			.entries( this.callbacksBySelector )
			.find( ( [ selector ] ) => selector === fullPath ) || [];

		if ( callbacks ) {
			console.log( `@@@ set2 ${ fullPath }`, value );

			callbacks.forEach( ( callback ) => callback( { path: fullPath, value } ) );
		}
	}

	private getObjectByPath( path: Path, parent: Record<PropertyKey, any> = window ) : null | ObjectByPath {
		const [ key, ...rest ] = path.split( '.' );

		const object = parent[ key ];

		if ( ! object ) {
			return null;
		}

		if ( typeof object !== 'object' ) {
			return null;
		}

		if ( rest.length ) {
			return this.getObjectByPath( rest.join( '.' ), object );
		}

		const lastSegment = rest.pop() || key;

		return {
			key: lastSegment,
			object,
			parent,
		};
	}
}
