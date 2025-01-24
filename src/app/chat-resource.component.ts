import { JsonPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  linkedSignal,
  resource,
  ResourceRef,
  ResourceStatus,
  signal,
  viewChild,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { FocusDirective } from './utils/focus.directive';

export type ChatRequest =
  | {
      type: 'username';
      id: number;
      date: number;
      name: string;
    }
  | {
      type: 'message';
      id: number;
      date: number;
      text: string;
    };

export type ChatResponse =
  | {
      type: 'id';
      id: number;
      date: number;
    }
  | {
      type: 'username';
      id: number;
      date: number;
      name: string;
    }
  | {
      type: 'userlist';
      id: number;
      date: number;
      users: string[];
    }
  | {
      type: 'message';
      id: number;
      date: number;
      name: string;
      text: string;
    };

export type StreamItem =
  | {
      value: ChatResponse | undefined;
    }
  | {
      error: unknown;
    };

export type SendFn = (message: string) => void;

export type ChatConnection = {
  resource: ResourceRef<ChatResponse | undefined>;
  connected: () => boolean;
  acceptedUserName: () => string;
  send: SendFn;
};

//
//  chatConnection returns the resource but also
//  some additional state
//
export function chatConnection(
  websocketUrl: string,
  userName: () => string
): ChatConnection {
  let connection: WebSocket;

  //
  //  Some extra state
  //
  const connected = signal(false);
  const id = signal(0);
  const acceptedUserName = signal('');

  const request = computed(() => ({
    userName: userName(),
  }));

  const chatResource = resource({
    request,
    stream: async (params) => {
      const userName = params.request?.userName;

      const resultSignal = signal<StreamItem>({
        value: undefined,
      });

      if (!userName) {
        return resultSignal;
      }

      connection = new WebSocket(websocketUrl, 'json');

      connection.addEventListener('open', (event) => {
        console.log('[open]');
        connected.set(true);
      });

      connection.addEventListener('message', (event) => {
        const value = JSON.parse(event.data) as ChatResponse;
        console.log('[message]', value);

        //
        //  The server sends us an id message to tell us
        //  about our unique session id after connecting
        //
        if (value.type === 'id') {
          id.set(value.id);
          sendUserName(value.id, userName, connection);
        }

        //
        // Perhaps the cosen username was corrected by the
        // server to assure unique names
        //
        if (value.type === 'username' && value.id == id()) {
          acceptedUserName.set(value.name);
        }

        //
        //  Messages but also information about new users
        //  joining the chat
        //
        if (value.type === 'message' || value.type === 'username') {
          resultSignal.set({ value });
        }
      });

      connection.addEventListener('error', (event) => {
        const error = event;
        console.log('[error]', error);
        resultSignal.set({ error });
      });

      params.abortSignal.addEventListener('abort', () => {
        console.log('clean up!');
        connection.close();
        connected.set(false);
        id.set(0);
        acceptedUserName.set('');
      });

      return resultSignal;
    },
  });

  return {
    connected,
    resource: chatResource,
    acceptedUserName,
    send: (message: string) => {
      const request: ChatRequest = {
        type: 'message',
        id: id(),
        date: Date.now(),
        text: message,
      };
      connection.send(JSON.stringify(request));
    },
  };
}

function sendUserName(id: number, userName: string, connection: WebSocket) {
  const message: ChatRequest = {
    type: 'username',
    id: id,
    date: Date.now(),
    name: userName,
  };
  connection.send(JSON.stringify(message));
}

function collectMessages(chat: ChatConnection) {
  const messages = signal<ChatResponse[]>([]);
  effect(() => {
    const message = chat.resource.value();
    if (message) {
      console.log('[effect]', message);
      messages.update((m) => [...m, message]);
    }
  });
  return messages;
}

@Component({
  selector: 'chat-resource-resource',
  imports: [FormsModule, JsonPipe, FocusDirective],
  templateUrl: './chat-resource.component.html',
})
export class ChatResourceComponent {
  ResourceStatus = ResourceStatus;

  userName = signal('');
  chat = chatConnection('ws://localhost:6502', this.userName);

  userNameInField = linkedSignal(() => this.chat.acceptedUserName());
  currentMessage = signal<string>('');

  messages = collectMessages(this.chat);

  send() {
    this.chat.send(this.currentMessage());
    this.currentMessage.set('');
  }

  join() {
    this.userName.set(this.userNameInField());
  }
}
