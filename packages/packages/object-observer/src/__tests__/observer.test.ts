import { ObjectObserver, observe } from '../';
import { Changes } from '../batch';

type ExtendedWindow = Window & {
	testObject: {
		foo: string;
		bar: string;
		nested1?: {
			foo: string;
			bar: string;
		},
		nested2?: {
			foo: string;
			bar: string;
		},
	};
};

type Item = {
	property: string;
	value: any;
}

describe( '@elementor/object-observer', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'should observe a specific property of an existing top-level object', () => {
		// Arrange.
		let batch: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'testObject',
			keys: [ 'foo' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
		} );

		( window as unknown as ExtendedWindow ).testObject.foo = 'changed';
		( window as unknown as ExtendedWindow ).testObject.bar = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( {
			foo: 'changed',
		} );
	} );

	it( 'should observe all properties of an existing top-level object', () => {
		// Arrange.
		let batch: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'testObject',
			keys: [ '*' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
		} );

		( window as unknown as ExtendedWindow ).testObject.foo = 'changed';
		( window as unknown as ExtendedWindow ).testObject.bar = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( {
			foo: 'changed',
			bar: 'changed',
		} );
	} );

	it( 'should observe a specific property of an existing nested object', () => {
		// Arrange.
		let batch: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
			nested1: {
				foo: 'bar',
				bar: 'baz',
			},
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'testObject.nested1',
			keys: [ 'foo' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
		} );

		( window as unknown as ExtendedWindow ).testObject.nested1!.foo = 'changed';
		( window as unknown as ExtendedWindow ).testObject.nested1!.bar = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( {
			foo: 'changed',
		} );
	} );

	it( 'should observe all properties of an existing nested object', () => {
		// Arrange.
		let batch: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
			nested1: {
				foo: 'bar',
				bar: 'baz',
			},
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'testObject.nested1',
			keys: [ '*' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
		} );

		( window as unknown as ExtendedWindow ).testObject.nested1!.foo = 'changed';
		( window as unknown as ExtendedWindow ).testObject.nested1!.bar = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( {
			foo: 'changed',
			bar: 'changed',
		} );
	} );

	it( 'should observe properties of a non-existing nested object', () => {
		// Arrange.
		let batch: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'testObject.nested1',
			keys: [ '*' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
		} );

		// TODO: Do we want an event also in this case?
		( window as unknown as ExtendedWindow ).testObject.nested1 = {
			foo: 'bar',
			bar: 'baz',
		};

		( window as unknown as ExtendedWindow ).testObject.nested1!.foo = 'changed';
		( window as unknown as ExtendedWindow ).testObject.nested1!.bar = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( {
			foo: 'changed',
			bar: 'changed',
		} );
	} );

	it( 'should observe existing & non-existing placeholder properties of an object', () => {
		// Arrange.
		let batch: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
			nested1: {
				foo: 'bar',
				bar: 'baz',
			},
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'testObject.[nestedId]',
			keys: [ '*' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
		} );

		( window as unknown as ExtendedWindow ).testObject.nested2 = {
			foo: 'bar',
			bar: 'baz',
		};

		( window as unknown as ExtendedWindow ).testObject.nested1!.foo = 'changed';
		( window as unknown as ExtendedWindow ).testObject.nested2!.bar = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( {
			foo: 'changed',
			bar: 'changed',
		} );
	} );

	it( 'should not observe non-existing top-level object', () => {
		// Arrange.
		let batch: Changes = [];

		// Act.
		observe( {
			selector: 'nonExisting',
			keys: [ '*' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
		} );

		( window as any ).nonExisting = {};

		( window as any ).nonExisting.foo = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( [] );
	} );

	it( 'should observe the same object twice for multiple observers', () => {
		// Arrange.
		let batch1: Changes = [];
		let batch2: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'testObject',
			keys: [ 'foo' ],
			callback: ( changesBatch ) => {
				batch1 = changesBatch;
			},
		} );

		observe( {
			selector: 'testObject',
			keys: [ 'bar' ],
			callback: ( changesBatch ) => {
				batch2 = changesBatch;
			},
		} );

		( window as unknown as ExtendedWindow ).testObject.foo = 'changed';
		( window as unknown as ExtendedWindow ).testObject.bar = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch1 ).toStrictEqual( {
			foo: 'changed',
		} );

		expect( batch2 ).toStrictEqual( {
			bar: 'changed',
		} );
	} );

	it( 'should observe object under a provided entry point', () => {
		// Arrange.
		let batch: Changes = [];

		const testObject = {
			foo: 'bar',
			bar: 'baz',
			nested: {
				foo: 'bar',
				bar: 'baz',
			},
		};

		( window as unknown as ExtendedWindow ).testObject = testObject;

		// Act.
		observe( {
			selector: 'nested',
			keys: [ '*' ],
			callback: ( changesBatch ) => {
				batch = changesBatch;
			},
			entry: testObject,
		} );

		testObject.nested.foo = 'changed';

		// Assert.
		jest.runAllTimers();

		expect( batch ).toStrictEqual( {
			foo: 'changed',
		} );
	} );
} );
