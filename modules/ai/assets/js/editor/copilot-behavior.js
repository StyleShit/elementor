import { importToEditor } from './utils/editor-integration';
import template1 from './template-1';
import template2 from './template-2';

export default class CopilotBehavior extends Marionette.Behavior {
	currentIndex = 0;
	currentContainer = null;

	ui() {
		return {
			loader: '.e-copilot-loader',
			addTemplateButton: '.elementor-add-template-button',
		};
	}

	events() {
		return {
			'click @ui.loader': 'onLoaderClick',
		};
	}

	appendNextSuggestion() {
		if ( this.currentContainer ) {
			return;
		}

		const template = this.getCurrentTemplate();

		const container = importToEditor( {
			at: this.view.getOption( 'at' ),
			template,
			historyTitle: 'Test',
			edit: false,
		} );

		this.currentContainer = container;

		container.view.$el[ 0 ].style = 'border: 2px dashed #D5DADF;';
		container.view.$el.find( '.e-con-inner' )[ 0 ].style = 'opacity: 0.24; pointer-events: none; position: relative;';
		container.view.$el.find( '.elementor-element-overlay' )[ 0 ].style = 'display: none;';

		const $buttons = jQuery( '<div>', {
			class: 'e-copilot-buttons',
			style: `
				position: absolute;
				left: 16px;
				top: 16px;
				background: #FFF;
				box-shadow: 0px 0px 4px 1px rgba(0,0,0,.2);
				font-family: Roboto;
				display: flex;
				gap: 8px;
				padding: 8px;
				border-radius: 8px;
				font-size: 13px;
			`,
		} );

		const $label = jQuery( '<div>', {
			style: `
				padding: 4px 8px;
				font-weight: 500;
			`,
		} );

		$label.append( `
			<i class="eicon-ai" style="margin-right: 4px;"></i>
			Copilot
		` );

		const $acceptIcon = jQuery( '<i>', {
			class: 'eicon-check',
			style: 'margin-right: 8px;',
		} );

		const $accept = jQuery( '<div>', {
			class: 'e-copilot-accept',
			style: 'padding: 4px 8px; border: 1px solid #51596280; border-radius: 4px; cursor: pointer; position: relative;',
		} );

		$accept.append( $acceptIcon );
		$accept.append( 'Accept' );

		const $acceptTooltip = jQuery( '<div>', {
			class: 'e-copilot-tooltip',
		} );

		$acceptTooltip.html( `
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="16" height="16" rx="4" fill="#0C0D0E" fill-opacity="0.09"/>
				<path d="M7.13281 8.86719H8.86719V7.13281H7.13281V8.86719ZM7.13281 9.73438V10.7305C7.13281 11.2305 6.95117 11.6602 6.58789 12.0195C6.22852 12.375 5.79492 12.5527 5.28711 12.5527C4.7793 12.5527 4.3457 12.373 3.98633 12.0137C3.62695 11.6543 3.44727 11.2188 3.44727 10.707C3.44727 10.207 3.62695 9.77539 3.98633 9.41211C4.3457 9.04883 4.77344 8.86719 5.26953 8.86719H6.26562V7.13281H5.26953C4.77344 7.13281 4.3457 6.95117 3.98633 6.58789C3.62695 6.22461 3.44727 5.79102 3.44727 5.28711C3.44727 4.7793 3.62695 4.3457 3.98633 3.98633C4.3457 3.62695 4.7793 3.44727 5.28711 3.44727C5.79492 3.44727 6.22852 3.62695 6.58789 3.98633C6.95117 4.3418 7.13281 4.76953 7.13281 5.26953V6.26562H8.86719V5.26953C8.86719 4.76953 9.04688 4.3418 9.40625 3.98633C9.76953 3.62695 10.2051 3.44727 10.7129 3.44727C11.2246 3.44727 11.6582 3.62695 12.0137 3.98633C12.373 4.3457 12.5527 4.7793 12.5527 5.28711C12.5527 5.79102 12.373 6.22461 12.0137 6.58789C11.6582 6.95117 11.2305 7.13281 10.7305 7.13281H9.73438V8.86719H10.7305C11.2305 8.86719 11.6582 9.04883 12.0137 9.41211C12.373 9.77539 12.5527 10.207 12.5527 10.707C12.5527 11.2188 12.373 11.6543 12.0137 12.0137C11.6582 12.373 11.2246 12.5527 10.7129 12.5527C10.2051 12.5527 9.76953 12.375 9.40625 12.0195C9.04688 11.6602 8.86719 11.2305 8.86719 10.7305V9.73438H7.13281ZM6.26562 6.26562V5.28711C6.26562 5.01758 6.16992 4.78906 5.97852 4.60156C5.78711 4.41016 5.55664 4.31445 5.28711 4.31445C5.02148 4.31445 4.79297 4.41016 4.60156 4.60156C4.41016 4.78906 4.31445 5.01758 4.31445 5.28711C4.31445 5.55664 4.41016 5.78711 4.60156 5.97852C4.79297 6.16992 5.02344 6.26562 5.29297 6.26562H6.26562ZM6.26562 9.73438H5.29297C5.02344 9.73438 4.79297 9.83008 4.60156 10.0215C4.41016 10.2129 4.31445 10.4414 4.31445 10.707C4.31445 10.9766 4.41016 11.207 4.60156 11.3984C4.79297 11.5898 5.02344 11.6855 5.29297 11.6855C5.55859 11.6855 5.78711 11.5898 5.97852 11.3984C6.16992 11.207 6.26562 10.9785 6.26562 10.7129V9.73438ZM9.73438 6.26562H10.7129C10.9785 6.26562 11.207 6.16992 11.3984 5.97852C11.5898 5.78711 11.6855 5.55664 11.6855 5.28711C11.6855 5.01758 11.5898 4.78906 11.3984 4.60156C11.2109 4.41016 10.9824 4.31445 10.7129 4.31445C10.4434 4.31445 10.2129 4.41016 10.0215 4.60156C9.83008 4.78906 9.73438 5.01758 9.73438 5.28711V6.26562ZM9.73438 9.73438V10.7129C9.73438 10.9785 9.83008 11.207 10.0215 11.3984C10.2129 11.5898 10.4434 11.6855 10.7129 11.6855C10.9824 11.6855 11.2109 11.5898 11.3984 11.3984C11.5898 11.207 11.6855 10.9766 11.6855 10.707C11.6855 10.4414 11.5898 10.2129 11.3984 10.0215C11.207 9.83008 10.9785 9.73438 10.7129 9.73438H9.73438Z" fill="white"/>
			</svg>

			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="16" height="16" rx="4" fill="#0C0D0E" fill-opacity="0.09"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M10.1212 4.87302C10.6436 4.87302 11.1446 5.0723 11.514 5.42703C11.8834 5.78177 12.0909 6.26288 12.0909 6.76455C12.0909 7.26622 11.8834 7.74734 11.514 8.10207C11.1446 8.4568 10.6436 8.65609 10.1212 8.65609H4.55191L6.2002 7.07321C6.37771 6.90274 6.37771 6.62636 6.2002 6.45589C6.02269 6.28543 5.73489 6.28543 5.55738 6.45589L3.13313 8.78393C2.95562 8.9544 2.95562 9.23078 3.13313 9.40125L5.55738 11.7293C5.73489 11.8998 6.02269 11.8998 6.2002 11.7293C6.37771 11.5588 6.37771 11.2824 6.2002 11.112L4.55191 9.5291H10.1212C10.8847 9.5291 11.6169 9.23784 12.1568 8.71938C12.6967 8.20093 13 7.49775 13 6.76455C13 6.03135 12.6967 5.32817 12.1568 4.80972C11.6169 4.29126 10.8847 4 10.1212 4H9.51515C9.26411 4 9.06061 4.19543 9.06061 4.43651C9.06061 4.67758 9.26411 4.87302 9.51515 4.87302H10.1212Z" fill="white"/>
			</svg>
		` );

		$accept.append( $acceptTooltip );

		$accept.on( 'click', () => {
			this.accept();
		} );

		const $dismissIcon = jQuery( '<i>', {
			class: 'eicon-close',
			style: 'margin-right: 8px;',
		} );

		const $dismiss = jQuery( '<div>', {
			class: 'e-copilot-dismiss',
			style: 'padding: 4px 8px; border: 1px solid #51596280; border-radius: 4px; cursor: pointer; position: relative;',
		} );

		$dismiss.append( $dismissIcon );
		$dismiss.append( 'Reject' );

		const $dismissTooltip = jQuery( '<div>', {
			class: 'e-copilot-tooltip',
		} );

		$dismissTooltip.html( `
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="16" height="16" rx="4" fill="#0C0D0E" fill-opacity="0.09"/>
				<path d="M7.13281 8.86719H8.86719V7.13281H7.13281V8.86719ZM7.13281 9.73438V10.7305C7.13281 11.2305 6.95117 11.6602 6.58789 12.0195C6.22852 12.375 5.79492 12.5527 5.28711 12.5527C4.7793 12.5527 4.3457 12.373 3.98633 12.0137C3.62695 11.6543 3.44727 11.2188 3.44727 10.707C3.44727 10.207 3.62695 9.77539 3.98633 9.41211C4.3457 9.04883 4.77344 8.86719 5.26953 8.86719H6.26562V7.13281H5.26953C4.77344 7.13281 4.3457 6.95117 3.98633 6.58789C3.62695 6.22461 3.44727 5.79102 3.44727 5.28711C3.44727 4.7793 3.62695 4.3457 3.98633 3.98633C4.3457 3.62695 4.7793 3.44727 5.28711 3.44727C5.79492 3.44727 6.22852 3.62695 6.58789 3.98633C6.95117 4.3418 7.13281 4.76953 7.13281 5.26953V6.26562H8.86719V5.26953C8.86719 4.76953 9.04688 4.3418 9.40625 3.98633C9.76953 3.62695 10.2051 3.44727 10.7129 3.44727C11.2246 3.44727 11.6582 3.62695 12.0137 3.98633C12.373 4.3457 12.5527 4.7793 12.5527 5.28711C12.5527 5.79102 12.373 6.22461 12.0137 6.58789C11.6582 6.95117 11.2305 7.13281 10.7305 7.13281H9.73438V8.86719H10.7305C11.2305 8.86719 11.6582 9.04883 12.0137 9.41211C12.373 9.77539 12.5527 10.207 12.5527 10.707C12.5527 11.2188 12.373 11.6543 12.0137 12.0137C11.6582 12.373 11.2246 12.5527 10.7129 12.5527C10.2051 12.5527 9.76953 12.375 9.40625 12.0195C9.04688 11.6602 8.86719 11.2305 8.86719 10.7305V9.73438H7.13281ZM6.26562 6.26562V5.28711C6.26562 5.01758 6.16992 4.78906 5.97852 4.60156C5.78711 4.41016 5.55664 4.31445 5.28711 4.31445C5.02148 4.31445 4.79297 4.41016 4.60156 4.60156C4.41016 4.78906 4.31445 5.01758 4.31445 5.28711C4.31445 5.55664 4.41016 5.78711 4.60156 5.97852C4.79297 6.16992 5.02344 6.26562 5.29297 6.26562H6.26562ZM6.26562 9.73438H5.29297C5.02344 9.73438 4.79297 9.83008 4.60156 10.0215C4.41016 10.2129 4.31445 10.4414 4.31445 10.707C4.31445 10.9766 4.41016 11.207 4.60156 11.3984C4.79297 11.5898 5.02344 11.6855 5.29297 11.6855C5.55859 11.6855 5.78711 11.5898 5.97852 11.3984C6.16992 11.207 6.26562 10.9785 6.26562 10.7129V9.73438ZM9.73438 6.26562H10.7129C10.9785 6.26562 11.207 6.16992 11.3984 5.97852C11.5898 5.78711 11.6855 5.55664 11.6855 5.28711C11.6855 5.01758 11.5898 4.78906 11.3984 4.60156C11.2109 4.41016 10.9824 4.31445 10.7129 4.31445C10.4434 4.31445 10.2129 4.41016 10.0215 4.60156C9.83008 4.78906 9.73438 5.01758 9.73438 5.28711V6.26562ZM9.73438 9.73438V10.7129C9.73438 10.9785 9.83008 11.207 10.0215 11.3984C10.2129 11.5898 10.4434 11.6855 10.7129 11.6855C10.9824 11.6855 11.2109 11.5898 11.3984 11.3984C11.5898 11.207 11.6855 10.9766 11.6855 10.707C11.6855 10.4414 11.5898 10.2129 11.3984 10.0215C11.207 9.83008 10.9785 9.73438 10.7129 9.73438H9.73438Z" fill="white"/>
			</svg>

			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="16" height="16" rx="4" fill="#0C0D0E" fill-opacity="0.09"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M5.46352 4.13017C5.54546 4.04683 5.65659 4 5.77247 4H12.1807C12.4511 4 12.7104 4.10926 12.9016 4.30374C13.0928 4.49822 13.2002 4.762 13.2002 5.03704V10.963C13.2002 11.238 13.0928 11.5018 12.9016 11.6963C12.7104 11.8907 12.4511 12 12.1807 12H5.77247C5.65659 12 5.54546 11.9532 5.46352 11.8698L2.55069 8.90686C2.54495 8.90103 2.53938 8.89504 2.53398 8.88889C2.31903 8.64443 2.2002 8.32797 2.2002 8C2.2002 7.67203 2.31903 7.35557 2.53398 7.11111C2.53938 7.10496 2.54495 7.09897 2.55069 7.09314L5.46352 4.13017ZM5.95345 4.88889L3.17867 7.71143C3.11122 7.7918 3.07404 7.8941 3.07404 8C3.07404 8.1059 3.11122 8.2082 3.17867 8.28857L5.95345 11.1111H12.1807C12.2193 11.1111 12.2564 11.0955 12.2837 11.0677C12.311 11.0399 12.3263 11.0023 12.3263 10.963V5.03704C12.3263 4.99774 12.311 4.96006 12.2837 4.93228C12.2564 4.9045 12.2193 4.88889 12.1807 4.88889H5.95345ZM7.21121 6.50055C7.38184 6.32698 7.65849 6.32698 7.82912 6.50055L8.6853 7.37146L9.54148 6.50055C9.71211 6.32698 9.98876 6.32698 10.1594 6.50055C10.33 6.67411 10.33 6.95552 10.1594 7.12908L9.30321 8L10.1594 8.87092C10.33 9.04448 10.33 9.32589 10.1594 9.49945C9.98876 9.67302 9.71211 9.67302 9.54148 9.49945L8.6853 8.62854L7.82912 9.49945C7.65849 9.67302 7.38184 9.67302 7.21121 9.49945C7.04059 9.32589 7.04059 9.04448 7.21121 8.87092L8.0674 8L7.21121 7.12908C7.04059 6.95552 7.04059 6.67411 7.21121 6.50055Z" fill="white"/>
			</svg>
		` );

		$dismiss.append( $dismissTooltip );

		$dismiss.on( 'click', () => {
			this.dismiss();
		} );

		$buttons.append( $label, $accept, $dismiss );
		container.view.$el.append( $buttons );
	}

	accept() {
		if ( ! this.currentContainer ) {
			return;
		}

		this.currentContainer.view.$el[ 0 ].style = '';
		this.currentContainer.view.$el.find( '.e-con-inner' )[ 0 ].style = '';
		this.currentContainer.view.$el.find( '.elementor-element-overlay' )[ 0 ].style = '';

		this.currentContainer.view.$el.find( '.e-copilot-buttons' ).remove();

		this.currentContainer = null;
	}

	dismiss() {
		if ( ! this.currentContainer ) {
			return;
		}

		$e.run( 'document/elements/delete', {
			containers: [ this.currentContainer ],
		} );

		this.currentContainer = null;
	}

	showLoader() {
		const $loader = this.$el.find( '.e-copilot-loader' );

		$loader.css( 'opacity', '1' );

		return new Promise( ( resolve ) => {
			setTimeout( () => {
				$loader.css( 'opacity', '0' );
				$loader[ 0 ].style.animation = '';
				resolve();
			}, 3000 );
		} );
	}

	getCurrentTemplate() {
		const templates = [
			template1,
			template2,
		];

		this.currentIndex++;

		return templates[ Math.min( templates.length - 1, this.currentIndex - 1 ) ];
	}

	onLoaderClick( e ) {
		e.stopPropagation();

		this.appendNextSuggestion();
	}

	initialize( ...args ) {
		super.initialize( ...args );

		const style = document.createElement( 'style' );

		style.innerHTML = `
			@keyframes blink {
				0%, 100% {
					opacity: 0.3;
				}

				50% {
					opacity: 0.7;
				}
			}

			.e-copilot-accept,
			.e-copilot-dismiss {
				transition: .3s all;
			}

			.e-copilot-accept:hover,
			.e-copilot-dismiss:hover {
				background: rgba(0,0,0,.04);
			}

			.e-copilot-tooltip {
				position: absolute;
				left: 50%;
				bottom: 100%;
				margin-bottom: 12px;
				transform: translateX(-50%);
				background: rgba(97, 97, 97, 0.90);
				font-family: Roboto;
				color: #FFF;
				padding: 8px;
				border-radius: 4px;
				opacity: 0;
				pointer-events: none;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 4px;
				transition: .3s all;
			}

			.e-copilot-tooltip::before {
				content: '';
				position: absolute;
				left: 50%;
				top: 100%;
				transform: translateX(-50%);
				border: 8px solid transparent;
				border-top: 8px solid rgba(97, 97, 97, 0.90);
			}

			div:hover > .e-copilot-tooltip {
				opacity: 1;
			}
		`;

		elementor.$previewContents[ 0 ].documentElement.appendChild( style );

		window.top.copilot = {
			nextSuggestion: async () => {
				await this.showLoader();

				this.appendNextSuggestion();
			},

			dismiss: () => {
				this.dismiss();
			},
		};
	}

	onRender() {
		const $loader = jQuery( '<div>', {
			class: 'e-copilot-loader',
			style: 'pointer-events: none; font-family: Roboto; font-size: 12px; position: absolute; transition: .3s all; opacity: 0; right: 8px; top: 8px; color: #69727D;',
		} );

		$loader.append( `
			<i class="eicon-ai" style="margin-right: 4px; animation: blink 1.5s infinite ease both"></i>
			Copilot is processing...
		` );

		this.ui.addTemplateButton.after( $loader );
	}
}
