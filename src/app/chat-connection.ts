import { computed, resource, ResourceRef, signal } from '@angular/core';

export type ChatRequest =
  | {
      type: 'username';
      id: number;
      name: string;
    }
  | {
      type: 'message';
      id: number;
      text: string;
    };

export type ChatResponse =
  | {
      type: 'id';
      id: number;
    }
  | {
      type: 'username';
      id: number;
      name: string;
    }
  | {
      type: 'message';
      id: number;
      name: string;
      text: string;
    };

export type StreamItem =
  | {
      value: ChatResponse[];
    }
  | {
      error: unknown;
    };

export type SendFn = (message: string) => void;

export type ChatConnection = {
  resource: ResourceRef<ChatResponse[] | undefined>;
  connected: () => boolean;
  acceptedUserName: () => string;
  send: SendFn;
};

export function chatConnection(
  websocketUrl: string,
  userName: () => string
): ChatConnection {
  let connection: WebSocket;

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

      let messages: ChatResponse[] = [];

      const resultSignal = signal<StreamItem>({
        value: messages,
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
        // Perhaps the chosen username was corrected by the
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
          messages = [...messages, value];
          resultSignal.set({ value: messages });
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

  const send: SendFn = (message: string) => {
    const request: ChatRequest = {
      type: 'message',
      id: id(),
      text: message,
    };
    connection.send(JSON.stringify(request));
  };

  return {
    connected,
    resource: chatResource,
    acceptedUserName,
    send,
  };
}

function sendUserName(id: number, userName: string, connection: WebSocket) {
  const message: ChatRequest = {
    type: 'username',
    id: id,
    name: userName,
  };
  connection.send(JSON.stringify(message));
}
