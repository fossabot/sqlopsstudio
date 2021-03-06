/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import Event, { Emitter } from 'vs/base/common/event';

import { ipcRenderer as ipc } from 'electron';

export const IBroadcastService = createDecorator<IBroadcastService>('broadcastService');

export interface IBroadcast {
	channel: string;
	payload: any;
}

export interface IBroadcastService {
	_serviceBrand: any;

	broadcast(b: IBroadcast): void;

	onBroadcast: Event<IBroadcast>;
}

export class BroadcastService implements IBroadcastService {
	public _serviceBrand: any;

	private _onBroadcast: Emitter<IBroadcast>;

	constructor(private windowId: number) {
		this._onBroadcast = new Emitter<IBroadcast>();

		this.registerListeners();
	}

	private registerListeners(): void {
		ipc.on('vscode:broadcast', (event, b: IBroadcast) => {
			this._onBroadcast.fire(b);
		});
	}

	public get onBroadcast(): Event<IBroadcast> {
		return this._onBroadcast.event;
	}

	public broadcast(b: IBroadcast): void {
		ipc.send('vscode:broadcast', this.windowId, {
			channel: b.channel,
			payload: b.payload
		});
	}
}