import { Batch, Changes, Item, Callback } from './batch';

export class ObjectObserver {
	private hasProxy: symbol;

	private entry: Record<PropertyKey, any>;

	private selector: string = '';

	private keys: string[] = [ '*' ];

	private callback: Callback = () => {};

	private placeholders: Record<string, string> = {};

	private batch: Batch | null = null;

	constructor( entry: Record<PropertyKey, any> = window ) {
		this.entry = entry;

		// Create a unique proxy identifier for each instance, to allow
		// multiple proxies on the same object.
		this.hasProxy = Symbol( 'hasProxy' );
	}

	static make() {
		return new this();
	}

	on( entry: Record<PropertyKey, any> ) {
		this.entry = entry;
	}

	for( selector: string ) {
		this.selector = selector;

		return this;
	}

	listenTo( keys: string[] ) {
		this.keys = keys;

		return this;
	}

	onChange( callback: Callback ) {
		this.callback = callback;

		return this;
	}

	observe() {
		this.observeObject( this.selector, this.keys, this.entry );
	}

	private observeObject(
		selector: string,
		keys: string[],
		parent: Record<PropertyKey, any>
	) {
		const segments = selector.split( '.' ),
			[ currentSegment, nextSegment, ...restSegments ] = segments;

		if ( this.isPlaceholder( currentSegment ) ) {
			return this.observeAll(
				parent,
				[ nextSegment, ...restSegments ],
				keys,
			);
		}

		const observedObject = this.getObservedObject( parent, currentSegment );

		if ( ! observedObject ) {
			return;
		}

		if ( nextSegment ) {
			parent[ currentSegment ] = this.createJunctionProxy( observedObject, nextSegment, restSegments, keys );

			return;
		}

		parent[ currentSegment ] = this.createDestinationProxy( observedObject, keys );
	}

	private observeAll( parent: object, segments: string[], keys: string[] ) {
		for ( const key in parent ) {
			this.observeObject( [ key, ...segments ].join( '.' ), keys, parent );
		}
	}

	private getObservedObject( parent: Record<PropertyKey, any>, key: string ) {
		const observedObject = parent[ key ];

		if ( ! observedObject ) {
			return null;
		}

		if ( this.isProxy( observedObject ) ) {
			return null;
		}

		if ( typeof observedObject !== 'object' ) {
			return null;
		}

		return observedObject;
	}

	private createJunctionProxy(
		observedObject: Record<PropertyKey, any>,
		nextSegment: string,
		restSegments: string[],
		keys: string[]
	) {
		const proxy = new Proxy( observedObject, {
			set: ( target, property, value, receiver ) => {
				Reflect.set( target, property, value, receiver );

				if ( this.isPlaceholder( nextSegment ) || nextSegment === property ) {
					this.observeObject( [ nextSegment, ...restSegments ].join( '.' ), keys, observedObject );
				}

				return true;
			},
		} );

		this.markProxy( proxy );

		if ( observedObject[ nextSegment ] ) {
			this.observeObject( [ nextSegment, ...restSegments ].join( '.' ), keys, observedObject );
		}

		return proxy;
	}

	private createDestinationProxy(
		observedObject: Record<PropertyKey, any>,
		keys: string[],
	) {
		const proxy = new Proxy( observedObject, {
			set: ( target, property, value, receiver ) => {
				if ( typeof property === 'symbol' ) {
					return Reflect.set( target, property, value, receiver );
				}

				const shouldObserveAll = ( keys.length === 1 && keys[ 0 ] === '*' ),
					shouldObserve = shouldObserveAll || keys.includes( property );

				if ( shouldObserve ) {
					this.batchChange( {
						property,
						value,
					} );
				}

				return Reflect.set( target, property, value, receiver );
			},
		} );

		this.markProxy( proxy );

		return proxy;
	}

	private isPlaceholder( value: string ) {
		return /^\[[\w_]+\]$/.test( value );
	}

	private markProxy( object: Record<PropertyKey, any> ) {
		object[ this.hasProxy ] = true;
	}

	private isProxy( object: Record<PropertyKey, any> ) {
		return object[ this.hasProxy ];
	}

	private batchChange( item: Item ) {
		if ( ! this.batch ) {
			this.batch = new Batch( this.callback );
		}

		this.batch.queue( item );
	}
}

type ObserveParams = {
	selector: string,
	keys: string[],
	callback: Callback,
	entry?: Record<PropertyKey, any>,
};

export function observe( {
	selector,
	keys,
	callback,
	entry,
} : ObserveParams ) {
	const observer = ObjectObserver
		.make()
		.for( selector )
		.listenTo( keys )
		.onChange( callback );

	if ( entry ) {
		observer.on( entry );
	}

	observer.observe();
}
