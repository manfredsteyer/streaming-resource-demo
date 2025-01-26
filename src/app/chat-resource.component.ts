import { JsonPipe } from '@angular/common';
import {
  Component,
  computed,
  linkedSignal,
  ResourceStatus,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { FocusDirective } from './utils/focus.directive';
import { chatConnection } from './chat-connection';

@Component({
  selector: 'chat-resource-resource',
  imports: [FormsModule, JsonPipe, FocusDirective],
  templateUrl: './chat-resource.component.html',
})
export class ChatResourceComponent {
  ResourceStatus = ResourceStatus;

  userName = signal('');
  chat = chatConnection('ws://localhost:6502', this.userName);
  messages = computed(() => this.chat.resource.value() ?? []);

  userNameInField = linkedSignal(() => this.chat.acceptedUserName());
  currentMessage = signal<string>('');

  send() {
    if (this.currentMessage()) {
      this.chat.send(this.currentMessage());
      this.currentMessage.set('');
    }
  }

  join() {
    if (this.userNameInField()) {
      this.userName.set(this.userNameInField());
    }
  }
}
