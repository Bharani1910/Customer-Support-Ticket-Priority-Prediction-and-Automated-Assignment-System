/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


/**
     @author        Paul Lucas
     @company       Salesforce
     @description   XdoToolTrackingEventHandler
     @date          18/3/2024

     TODO:
 */


import {api} from 'lwc';
import XdoToolTrackingEventHandlerBase from 'c/xdoToolTrackingEventHandlerBase';

export default class XdoToolTrackingEventHandler extends XdoToolTrackingEventHandlerBase {
	/**
	 * Internal properties
	 */

	/**
	 * Private properties
	 */
	message = 'Initialising...';

	/**
	 * Public properties
	 */
	@api recordId;
	@api objectApiName;

	@api
	track(componentName, dataset) {
		try {
			this.componentName = componentName;
			this.trackEvent(dataset);
		}
		catch (e) {
			console.log('>>>>> Error calling XdoToolTrackingEventHandler.track with exception', e);
		}
	}

	/**
	 * Getters and Setters
	 */

	/**
	 * connectedCallBack: Called when the element is inserted into a document. This hook flows from parent to child.
	 * You can’t access child elements in the component body because they don’t exist yet.
	 * You can access the host element with this.template.
	 */
	connectedCallback() {
	}

	/**
	 * disconnectedCallback: Called when the element is removed from a document. This hook flows from parent to child.
	 */
	disconnectedCallback() {
	}

	/**
	 * renderedCallback: Called after every render of the component. This lifecycle hook is specific to
	 * Lightning Web Components, it isn’t from the HTML custom elements specification. This hook flows from child to parent.
	 */
	renderedCallback() {
	}

	/**
	 * errorCallback: Called when a descendant component throws an error in one of its lifecycle hooks.
	 * The error argument is a JavaScript native error object, and the stack argument is a string.
	 * This lifecycle hook is specific to Lightning Web Components, it isn’t from the HTML custom elements specification.
	 */
	errorCallback() {
	}
}