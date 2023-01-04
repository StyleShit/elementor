import { Path } from './observers-manager';

type ObjectObserverProps = {
	object: Record<PropertyKey, any>,
	path: Path,
	onChange: Callback,
}

type Callback = ( data: {
	property: string,
	value: any,
	path: Path,
} ) => void;

const isProxy = Symbol( 'isProxy' );
const isRevoked = Symbol( 'isRevoked' );

export class ObjectObserver {
	private proxy: Record<PropertyKey, any>;

	private object: Record<PropertyKey, any>;

	private path: string;

	private onChange: Callback;

	constructor( props: ObjectObserverProps ) {
		this.object = props.object;
		this.path = props.path;
		this.onChange = props.onChange;

		this.proxy = this.makeProxy();
	}

	getProxy() {
		return this.proxy;
	}

	getOriginalObject() {
		return this.object;
	}

	revoke() {
		this.proxy = this.revokeProxy( this.proxy );
	}

	private revokeProxy( proxy ) {
		proxy[ isRevoked ] = true;

		Object.entries( proxy ).forEach( ( [ key, value ] ) => {
			if ( value[ isProxy ] ) {
				proxy[ key ] = this.revokeProxy( value );
			}
		} );

		return proxy;
	}

	private makeProxy() {
		// if ( this.object[ isProxy ] ) {
		// 	this.object[isRevoked] = false;
		//
		// 	return this.object;
		// }

		const proxy = new Proxy( this.object, {
			set: ( target, property, value, receiver ) => {
				const returnValue = Reflect.set( target, property, value, receiver );

				// The property name can be either a string or a symbol, but eventually it will be used
				// as a part of a path (i.e. "elementor.documents.[property]"), so it has to be a string.
				if ( typeof property !== 'string' ) {
					return returnValue;
				}

				// Don't trigger the callback for revoked proxies.
				// Technically, we can use `Proxy.revocable()` to return an object with a `revoke()` method,
				// but there are cases where someone keeps a reference to the revoked proxy object and tries to use it,
				// so we have to keep an actual object here so we won't break the code.
				if ( receiver[ isRevoked ] ) {
					return returnValue;
				}

				// Don't trigger the callback for
				if ( value[ isProxy ] ) {
					value[ isRevoked ] = false;
				}

				this.onChange( { property, value, path: this.path } );

				return returnValue;
			},
		} );

		// trigger initial change.
		Object.entries( this.object ).forEach( ( [ key, value ] ) => {
			this.onChange( { property: key, value, path: this.path } );
		} );

		proxy[ isProxy ] = true;
		proxy[ isRevoked ] = false;

		return proxy;
	}
}
