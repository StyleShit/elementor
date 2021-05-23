var SortableBehavior;

SortableBehavior = Marionette.Behavior.extend( {
	defaults: {
		elChildType: 'widget',
	},

	events: {
		sortstart: 'onSortStart',
		sortreceive: 'onSortReceive',
		sortupdate: 'onSortUpdate',
		sortover: 'onSortOver',
		sortout: 'onSortOut',
	},

	initialize: function() {
		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched )
			.listenTo( this.view.options.model, 'request:sort:start', this.startSort )
			.listenTo( this.view.options.model, 'request:sort:update', this.updateSort )
			.listenTo( this.view.options.model, 'request:sort:receive', this.receiveSort );
	},

	onEditModeSwitched: function( activeMode ) {
		if ( 'edit' === activeMode ) {
			this.activate();
		} else {
			this.deactivate();
		}
	},

	onRender: function() {
		var self = this;

		_.defer( function() {
			self.onEditModeSwitched( elementor.channels.dataEditMode.request( 'activeMode' ) );
		} );
	},

	onDestroy: function() {
		this.deactivate();
	},

	/**
	 * Create an item placeholder in order to avoid UI jumps due to flex.
	 *
	 * @param {Object} $element - jQuery element instance to create placeholder for.
	 * @param {string} className - Placeholder class.
	 * @param {boolean} hide - Whether to hide the original element.
	 *
	 * @returns {void}
	 */
	createPlaceholder: function( $element, className = '', hide = true ) {
		// Get the actual item size.
		$element.css( 'display', '' );
		const { clientWidth: width, clientHeight: height } = $element[ 0 ];

		if ( hide ) {
			$element.css( 'display', 'none' );
		}

		jQuery( '<div></div>' ).css( {
			...$element.css( [
				'flex-basis',
				'flex-grow',
				'flex-shrink',
				'order',
				'position',
			] ),
			width,
			height,
		} ).addClass( className ).insertAfter( $element );
	},

	/**
	 * Return a settings object for jQuery UI sortable to make it swappable.
	 *
	 * @returns {{stop: stop, start: start}}
	 */
	getSwappableOptions() {
		const $childViewContainer = this.getChildViewContainer(),
			activeClass = 'e-swappable--active',
			dragOverClass = 'e-swappable--dragging-over',
			placeholderClass = 'e-swappable--item-placholder',
			elementsSelector = '> .elementor-widget';

		return {
			start: ( event, ui ) => {
				$childViewContainer.addClass( activeClass );

				// TODO: Find a better solution than this hack.
				// Used in order to prevent dragging a container into itself.
				this.createPlaceholder( ui.item, placeholderClass );

				// Remove the pointer events for the helper in order to allow `mouseenter` event
				// on other widgets while dragging.
				ui.helper.css( 'pointer-events', 'none' );

				// Swappable listeners.
				$childViewContainer.on( 'mouseenter.swappable', elementsSelector, ( e ) => {
					e.stopPropagation();

					const $target = jQuery( e.currentTarget );

					$target.addClass( dragOverClass );

					// Pass the swappable data over the a `data` attribute.
					ui.item.attr( 'data-swappable', JSON.stringify( {
						origin: {
							position: ui.item.css( 'order' ),
							id: ui.item.attr( 'data-id' ),
						},
						target: {
							position: $target.css( 'order' ),
							id: $target.attr( 'data-id' ),
						},
					} ) );
				} );

				// Remove the `data-swappable` attribute on mouse leave to prevent moving the element accidentally.
				$childViewContainer.on( 'mouseleave.swappable', elementsSelector, ( e ) => {
					jQuery( e.currentTarget ).removeClass( dragOverClass );
					ui.item.removeAttr( 'data-swappable' );
				} );

				// Draggable listeners (to drag an element out of a container).
				elementor.$previewContents.on( 'mouseenter.sortable', '.elementor-element', ( e ) => {
					const $target = jQuery( e.currentTarget );

					ui.placeholder.css( 'order', $target.css( 'order' ) );
				} );
			},
			stop: ( event, ui ) => {
				// Get the swappable data.
				const { origin, target } = JSON.parse( ui.item.attr( 'data-swappable' ) || '{}' );

				// Remove the swappable data attribute.
				ui.item.removeAttr( 'data-swappable' );

				// Cleanup.
				$childViewContainer.off( 'mouseenter.swappable' );
				$childViewContainer.off( 'mouseleave.swappable' );
				$childViewContainer.off( 'mouseenter.swappable' );
				elementor.$previewContents.off( 'mouseenter.sortable' );
				$childViewContainer.removeClass( activeClass );
				$childViewContainer.find( `.${ dragOverClass }` ).removeClass( dragOverClass );
				$childViewContainer.find( `.${ placeholderClass }` ).remove();

				// Exit when there are no containers.
				if ( ! origin || ! target ) {
					return;
				}

				// Don't act when it's the same container.
				if ( origin.id === target.id ) {
					return;
				}

				// Get the associated containers.
				const itemContainer = elementor.getContainer( origin.id ),
					targetContainer = elementor.getContainer( target.id );

				// Change the order setting.
				this.moveChild( targetContainer, origin.position );
				this.moveChild( itemContainer, target.position );
			},
		};
	},

	activate: function() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}

		if ( this.getChildViewContainer().sortable( 'instance' ) ) {
			return;
		}

		var $childViewContainer = this.getChildViewContainer(),
			defaultSortableOptions = {
				placeholder: 'elementor-sortable-placeholder elementor-' + this.getOption( 'elChildType' ) + '-placeholder',
				cursorAt: {
					top: 20,
					left: 25,
				},
				helper: this._getSortableHelper.bind( this ),
				cancel: 'input, textarea, button, select, option, .elementor-inline-editing, .elementor-tab-title',

			},
			sortableOptions = _.extend( defaultSortableOptions, this.view.getSortableOptions() );

		// Add a swappable behavior (used for flex containers).
		if ( this.isSwappable() ) {
			$childViewContainer.addClass( 'e-swappable' );
			sortableOptions = _.extend( this.getSwappableOptions(), sortableOptions );
		}

		$childViewContainer.sortable( sortableOptions );
	},

	_getSortableHelper: function( event, $item ) {
		var model = this.view.collection.get( {
			cid: $item.data( 'model-cid' ),
		} );

		return '<div style="height: 84px; width: 125px;" class="elementor-sortable-helper elementor-sortable-helper-' + model.get( 'elType' ) + '"><div class="icon"><i class="' + model.getIcon() + '"></i></div><div class="elementor-element-title-wrapper"><div class="title">' + model.getTitle() + '</div></div></div>';
	},

	getChildViewContainer: function() {
		return this.view.getChildViewContainer( this.view );
	},

	// This method is used to fix widgets index detection when dragging or sorting using the preview interface,
	// The natural widget index in the column is wrong, since there is a `.elementor-background-overlay` element
	// at the beginning of the column
	getSortedElementNewIndex( $element ) {
		const draggedModel = elementor.channels.data.request( 'dragging:model' ),
			draggedElType = draggedModel.get( 'elType' );

		let newIndex = $element.index();

		if ( 'widget' === draggedElType && elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ] ) {
			newIndex--;
		}

		return newIndex;
	},

	deactivate: function() {
		var childViewContainer = this.getChildViewContainer();

		if ( childViewContainer.sortable( 'instance' ) ) {
			childViewContainer.sortable( 'destroy' );
		}
	},

	/**
	 * Determine if the current instance of Sortable is swappable.
	 *
	 * @returns {boolean}
	 */
	isSwappable: function() {
		return ! ! this.view.getSortableOptions().swappable;
	},

	startSort: function( event, ui ) {
		event.stopPropagation();

		const container = elementor.getContainer( ui.item.attr( 'data-id' ) );

		elementor.channels.data
			.reply( 'dragging:model', container.model )
			.reply( 'dragging:view', container.view )
			.reply( 'dragging:parent:view', this.view )
			.trigger( 'drag:start', container.model )
			.trigger( container.model.get( 'elType' ) + ':drag:start' );
	},

	// On sorting element
	updateSort: function( ui, newIndex ) {
		// Don't move when it's a swappable container ( the move command is being handled in the swappable callback ).
		if ( this.isSwappable() ) {
			return;
		}

		if ( undefined === newIndex ) {
			newIndex = ui.item.index();
		}

		const child = elementor.channels.data.request( 'dragging:view' ).getContainer();
		this.moveChild( child, newIndex );
	},

	// On receiving element from another container
	receiveSort: function( event, ui, newIndex ) {
		event.stopPropagation();

		if ( this.view.isCollectionFilled() ) {
			jQuery( ui.sender ).sortable( 'cancel' );

			return;
		}

		var model = elementor.channels.data.request( 'dragging:model' ),
			draggedElType = model.get( 'elType' ),
			draggedIsInnerSection = 'section' === draggedElType && model.get( 'isInner' ),
			targetIsInnerColumn = 'column' === this.view.getElementType() && this.view.isInner();

		if ( draggedIsInnerSection && targetIsInnerColumn ) {
			jQuery( ui.sender ).sortable( 'cancel' );

			return;
		}

		if ( undefined === newIndex ) {
			newIndex = ui.item.index();
		}

		const child = elementor.channels.data.request( 'dragging:view' ).getContainer();

		// On a swappable element, the movement should be handled using flex order.
		if ( this.isSwappable() ) {
			newIndex = parseInt( ui.placeholder.css( 'order' ) );
		}

		this.moveChild( child, newIndex );
	},

	onSortStart: function( event, ui ) {
		if ( 'column' === this.options.elChildType ) {
			var uiData = ui.item.data( 'sortableItem' ),
				uiItems = uiData.items,
				itemHeight = 0;

			uiItems.forEach( function( item ) {
				if ( item.item[ 0 ] === ui.item[ 0 ] ) {
					itemHeight = item.height;
					return false;
				}
			} );

			ui.placeholder.height( itemHeight );
		}

		this.startSort( event, ui );
	},

	onSortOver: function( event ) {
		event.stopPropagation();

		var model = elementor.channels.data.request( 'dragging:model' );

		jQuery( event.target )
			.addClass( 'elementor-draggable-over' )
			.attr( {
				'data-dragged-element': model.get( 'elType' ),
				'data-dragged-is-inner': model.get( 'isInner' ),
			} );

		this.$el.addClass( 'elementor-dragging-on-child' );
	},

	onSortOut: function( event ) {
		event.stopPropagation();

		jQuery( event.target )
			.removeClass( 'elementor-draggable-over' )
			.removeAttr( 'data-dragged-element data-dragged-is-inner' );

		this.$el.removeClass( 'elementor-dragging-on-child' );
	},

	onSortReceive: function( event, ui ) {
		this.receiveSort( event, ui, this.getSortedElementNewIndex( ui.item ) );
	},

	onSortUpdate: function( event, ui ) {
		event.stopPropagation();

		if ( this.getChildViewContainer()[ 0 ] !== ui.item.parent()[ 0 ] ) {
			return;
		}

		this.updateSort( ui, this.getSortedElementNewIndex( ui.item ) );
	},

	onAddChild: function( view ) {
		view.$el.attr( 'data-model-cid', view.model.cid );
	},

	/**
	 * Move a child container to another position.
	 *
	 * @param {Container} child - The child container to move.
	 * @param {int|string} index - New index.
	 *
	 * @returns {void}
	 */
	moveChild: function( child, index ) {
		$e.run( 'document/elements/move', {
			container: child,
			target: this.view.getContainer(),
			options: {
				at: index,
			},
		} );
	},
} );

module.exports = SortableBehavior;
