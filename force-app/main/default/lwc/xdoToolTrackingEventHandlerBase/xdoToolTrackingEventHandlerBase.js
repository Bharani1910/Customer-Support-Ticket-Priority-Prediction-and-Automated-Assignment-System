/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


/**
     @author        Paul Lucas
     @company       Salesforce
     @description   XdoToolTrackingEventHandlerBase
     @date          30/11/2023

     TODO:
 */

import {LightningElement} from 'lwc';
import {NavigationMixin} from "lightning/navigation";

import publishTrackingEvent from '@salesforce/apex/XDO_Tool_TrackingEventController.publishTrackingEvent';
import {XdoToolTrackingEvent} from 'c/xdoToolTrackingEvent';

import {DOM} from 'c/xdoToolConstants';

const TRACKING_PREFIX = 'tracking';
const DEFAULT_TRACKING_SELECTOR = '[data-tracking="true"]';

// export default class XdoToolTrackingEventHandlerBase extends LightningModal(NavigationMixin(LightningElement)) {
export default class XdoToolTrackingEventHandlerBase extends NavigationMixin(LightningElement) {
	_error;
	_componentName;
	_siteId;
	_eventListener;
	_predicate;
	_eventKey = null;
	_eventQueue = {};
	_callers = [];

	get error() {
		return this._error;
	}

	set error(value) {
		this._error = value;

		if (this._error) {
			console.error(this._error);
		}
	}

	get isCommunity() {
		return !!this._siteId;
	}

	set siteId(value) {
		this._siteId = value;
	}

	get eventKey() {
		return this._eventKey;
	}

	set eventKey(value) {
		this._eventKey = value;
	}

	get stagedEvent() {
		if (this.eventKey) {
			return this._eventQueue[this.eventKey];
		}
		return null;
	}

	set stagedEvent(value) {
		if (this.eventKey) {
			this._eventQueue[this.eventKey] = value;
		}
	}

	set componentName(value) {
		this._componentName = value;
	}

	get componentName() {
		const defaultName = /([^(/]*?)\.js/g.exec(new Error().stack)[1];

		// return this.constructor.name ? this.constructor.name : '';
		return this._componentName && this._componentName !== '' ? this._componentName : defaultName;
	}

	get eventListener() {
		return this._eventListener;
	}

	set eventListener(value) {
		this._eventListener = value;
	}

	get predicate() {
		return this._predicate;
	}

	set predicate(value) {
		this._predicate = value;
	}

	get callers() {
		return this._callers || [];
	}

	set callers(value) {
		this._callers = [...value];
	}

	connectedCallback() {
		this.eventListener = this.handleEventDelegate(this.componentName);
	}

	disconnectedCallback() {
		this.unregisterTrackingHandlers();
	}

	async publishTrackingEvent(trackingEvent) {
		try {
			await publishTrackingEvent({
				'serializedEvent': trackingEvent.getSerialized()
			});
		} catch (e) {
			this.error = `>>>>> Error executing publishTrackingEvent for ${trackingEvent.getSerialized()}: ${e.message}`;
		}
	}

	async registerTrackingHandlers(selectors = '') {
		// if (this.isCommunity) {
		this.callers = this.template.querySelectorAll(`${DEFAULT_TRACKING_SELECTOR}, ${selectors}`.replace(/(^\s*,)|(,\s*$)/g, ''));
		this.callers.forEach((element) => {
			let event = element?.dataset?.trackingDomEvent;

			if (event) {
				console.log(`>>>>> Add event listener for ${event}`)
				element.addEventListener(event, this.eventListener);

				switch (event) {
					case DOM.EVENT.LOAD:
						this.trackEvent(element.dataset);
						break;
					default:
						break;
				}
			}
		});
		// }
	}

	unregisterTrackingHandlers() {
		this.callers.forEach((element) => {
			let event = element?.dataset?.trackingDomEvent;

			if (event) {
				element.removeEventListener(event, this.eventListener, false);
			}
		});
	}

	normaliseDataset(dataset) {
		return Object.keys(dataset).reduce((trackingData, key) => {
			const formattedKey = `${TRACKING_PREFIX}${key.replace(TRACKING_PREFIX, '').slice(0, 1).toUpperCase() + key.replace(TRACKING_PREFIX, '').slice(1)}`;
			trackingData[formattedKey] = dataset[key];
			return trackingData;
		}, {});
	}

	trackEvent(dataset) {
		const normalDataset = this.normaliseDataset(dataset);
		const e = new CustomEvent(normalDataset?.trackingDomEvent || 'tracking', {bubbles: true, cancelable: false});

		e.dataset = normalDataset;
		e.dataset.trackingId = this.componentName;
		this.handleEventDelegate(this.componentName)(e);
	}

	getPredicate(parameters, body) {
		// eslint-disable-next-line no-new-func
		return new Function(parameters, `return ${body ? body : true};`);
	}

	handleEventDelegate(componentName) {
		return (event) => {
			const dataset = event?.currentTarget?.dataset || event?.dataset;
			const {trackingCondition: condition} = dataset;
			const trackingEvent = XdoToolTrackingEvent.createInstance(componentName, dataset);
			this.predicate = this.getPredicate('event, args', condition);

			// if (this.predicate(event, this.getPredicateArgs(args))) {
			if (this.predicate(event)) {
				try {
					this.eventKey = trackingEvent.id;

					if (this.stagedEvent) {
						window.clearTimeout(this.stagedEvent);
					}

					// eslint-disable-next-line @lwc/lwc/no-async-operation
					this.stagedEvent = window.setTimeout(this.publishTrackingEvent.bind(this, trackingEvent), trackingEvent.getDelay());
				} catch (e) {
					this.error = `>>>>> Error staging tracking event for ${trackingEvent.getSerialized()}: ${e.message}`;
				}
			}
		}
	}
}