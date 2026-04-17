import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '@app/core/services/http/chat.service';
import { Message } from '@app/core/models/bussiness/message';
import { StorageService } from '@app/core/services/shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { AuthService } from '@app/core/services/http/auth.service';
import { User } from '@app/core/models/bussiness/user';
import { TwilioMessageRequest } from '@app/core/models/dtos/twilioMessageRequest';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  user: User = new User();
  isMinimized: boolean = true;
  messages: Message[] = [];
  isLoading: boolean = false;
  currentUserId: string = '51231a62-8bc9-42cd-b420-3fece744762f';
  botUserId: string = 'bot-agent';
  private shouldScrollToBottom: boolean = false;
  avatarDisabled: boolean = true;

  constructor(
    private chatService: ChatService, 
    private storageService: StorageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeChat();
    this.user = this.authService.getUserLogged();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private initializeChat(): void {
    const storedMessages = this.storageService.get<Message[]>(StorageKeyConst._CHAT_MESSAGES);
    
    if (storedMessages && storedMessages.length > 0) {
      this.messages = storedMessages;
    } else {
      const welcomeMessage = new Message();
      welcomeMessage.userId = this.botUserId;
      welcomeMessage.message = 'Hi! How can I assist you today?';
      welcomeMessage.createdAt = new Date();

      this.messages.push(welcomeMessage);
      this.saveMessages();
    }
    
    this.shouldScrollToBottom = true;
  }

  private saveMessages(): void {
    this.storageService.set(StorageKeyConst._CHAT_MESSAGES, this.messages);
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  onSendMessage(messageInput: HTMLInputElement): void {
    const messageText = messageInput.value.trim();
    if (messageText && !this.isLoading) {
      this.sendMessage(messageText);
      messageInput.value = '';
    }
  }

  onKeyPress(event: KeyboardEvent, messageInput: HTMLInputElement): void {
    if (event.key === 'Enter') {
      this.onSendMessage(messageInput);
    }
  }

  private sendMessage(messageText: string): void {
    const userMessage = new Message();
    userMessage.userId = this.currentUserId;
    userMessage.message = messageText;
    userMessage.createdAt = new Date();
    
    this.messages.push(userMessage);
    this.saveMessages();
    this.shouldScrollToBottom = true;
    
    this.isLoading = true;
    
    const twilioRequest = new TwilioMessageRequest(messageText);
    
    this.chatService.twilioWsAgent(twilioRequest).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.simulateAgentResponse(response);
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.isLoading = false;
        this.simulateAgentResponse('Sorry, there was an error processing your message.');
      }
    });
  }

  private simulateAgentResponse(userMessage: string): void {
    setTimeout(() => {
      const agentResponse = userMessage;
      const agentMessage = new Message();
      agentMessage.userId = this.botUserId;
      agentMessage.message = agentResponse;
      agentMessage.createdAt = new Date();
      
      this.messages.push(agentMessage);
      this.saveMessages();
      this.shouldScrollToBottom = true;
    }, 1000 + Math.random() * 2000); 
  }

  isUserMessage(message: Message): boolean {
    return message.userId === this.currentUserId;
  }

  isAgentMessage(message: Message): boolean {
    return message.userId !== this.currentUserId;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatMessageText(text: string): string {
    if (!text) return '';
    
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  clearConversation(): void {
    this.messages = [];
    this.storageService.remove(StorageKeyConst._CHAT_MESSAGES);
    
    const welcomeMessage = new Message();
    welcomeMessage.userId = this.botUserId;
    welcomeMessage.message = 'Hi! How can I assist you today?';
    welcomeMessage.createdAt = new Date();
    
    this.messages.push(welcomeMessage);
    this.saveMessages();
    this.shouldScrollToBottom = true;
  }
}
