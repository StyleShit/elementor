export type Changes = Record<string, any>;

export type Item = {
	property: string;
	value: any;
};

export type Callback = ( changes: Changes ) => void;

export class Batch {
	private callback : Callback;

	private batch : Changes = {};

	private timeout : ReturnType<typeof setTimeout> | null = null;

	constructor( callback: Callback ) {
		this.callback = callback;
	}

	queue( item: { property : string, value : any } ) {
		this.batch[ item.property ] = item.value;

		if ( this.timeout ) {
			clearTimeout( this.timeout );
		}

		this.timeout = setTimeout( () => {
			this.callback( this.batch );

			this.batch = {};
		} );
	}
}
