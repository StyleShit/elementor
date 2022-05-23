import { freeMock, setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

describe( '$e.run( \'document/elements/settings\' )', () => {
	beforeEach( async () => {
		await setupMock();

		global.elementor = {
			documents: {
				getCurrent: () => ( {
					history: {
						getActive: () => false,
					},
				} ),
			},
			config: {
				// document
			},
		};

		global.elementorCommon = {
			helpers: {
				consoleError: () => {},
			},
		};

		_.debounce = ( fn ) => fn;

		global.elementorModules = {
			editor: {
				Container: Object,
			},
		};

		$e.modules.editor = {
			document: {
				CommandHistoryDebounceBase: ( await import( 'elementor-document/command-bases/command-history-debounce-base' ) ).default,
			},
		};
		const { Settings } = await import( 'elementor-document/elements/commands/settings' );

		$e.components.register( new class extends $e.modules.ComponentBase {
			getNamespace() {
				return 'document/save';
			}

			defaultCommandsInternal() {
				return {
					'set-is-modified': () => {},
				};
			}
		} );

		$e.components.register( new class extends $e.modules.ComponentBase {
			getNamespace() {
				return 'document/elements';
			}

			defaultCommands() {
				return this.importCommands( {
					Settings,
				} );
			}
		} );
	} );

	afterEach( async () => {
		await freeMock();
	} );

	it( 'Should require `container` argument', async () => {
		// Act & Assert.
		expect( () => {
			$e.commands.run( 'document/elements/settings', { asd: 1 } );
		} ).toThrow( 'container or containers are required.' );
	} );

	it( 'Should require `container` argument to be Container instance', async () => {
		// Act & Assert.
		expect( () => {
			$e.commands.run( 'document/elements/settings', {
				container: 'non-Container-instance',
			} );
		} ).toThrow( 'container' );
	} );

	it( 'Should require `settings` argument', async () => {
		// Arrange.
		const container = createContainer();

		// Act & Assert.
		expect( () => {
			$e.commands.run( 'document/elements/settings', {
				container: 'non-Container-instance',
			} );
		} ).toThrow();
	} );
} );

/**
 * Mock Container.
 * TODO: Move to testing utils.
 *
 * @return {object}
 */
function createContainer( {
	type,
	widgetType,
	id,
	settings = {},
	children = [],
	parent = null,
	index = 0,
	isInner = false,
	...args
} = {} ) {
	const container = {
		id,
		type,
		view: { _index: index },
		settings: {
			toJSON: () => ( {
				...settings,
			} ),
		},
		children,
		model: {
			get: ( key ) => {
				const map = {
					elType: type,
					widgetType,
				};

				return map[ key ];
			},
			toJSON: () => ( {
				elType: type,
				isInner,
			} ),
		},
		...args,
	};

	// Attach the current Container as a parent of its children Containers.
	children.forEach( ( child, i ) => {
		child.parent = container;
		child.view._index = i;
	} );

	// Attach the current Container as a child of its parent Container.
	if ( parent ) {
		if ( ! parent.children ) {
			parent.children = [];
		}

		parent.children.push( container );
		container.view._index = parent.children.length - 1;
	}

	return container;
}
