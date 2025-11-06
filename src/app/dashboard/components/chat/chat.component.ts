import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '@app/core/services/http/chat.service';
import { Message } from '@app/core/models/bussiness/message';
import { StorageService } from '@app/core/services/shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { User } from '@app/core/models/bussiness/user';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  
  isMinimized: boolean = true;
  messages: Message[] = [];
  isLoading: boolean = false;
  currentUserId: string = '51231a62-8bc9-42cd-b420-3fece744762f';
  botUserId: string = 'bot-agent';
  private shouldScrollToBottom: boolean = false;

  constructor(private chatService: ChatService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.initializeChat();
    // this.getUser();
    // let user = this.storageService.get(StorageKeyConst._USER_LOGGED) as User;
    // if(user){
    //   this.currentUserId = user.id;
    //   this.botUserId = user.id;
    // }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private initializeChat(): void {
    // Mensaje inicial del agente
    const welcomeMessage = new Message();
    welcomeMessage.userId = this.botUserId;
    welcomeMessage.message = 'Hi! How can I assist you today?';
    welcomeMessage.createdAt = new Date();
    
    this.messages.push(welcomeMessage);
    this.shouldScrollToBottom = true;
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

  private getUser(): void {
    let user = this.storageService.get(StorageKeyConst._USER_LOGGED) as any;
    if(user){
      this.currentUserId = user.id;
      this.botUserId = user.id;
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
    this.shouldScrollToBottom = true;
    
    this.isLoading = true;
    
    this.chatService.createMessage({
      userId: userMessage.userId,
      message: userMessage.message
    }).subscribe({
      next: (response: any) => {
        console.log('Mensaje enviado exitosamente:', response);
        this.isLoading = false;
        this.simulateAgentResponse(response.response);
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.isLoading = false;
        this.simulateAgentResponse(messageText);
      }
    });
  }

  private simulateAgentResponse(userMessage: string): void {
    // Simular delay de respuesta del agente
    setTimeout(() => {
      const agentResponse = userMessage;
      const agentMessage = new Message();
      agentMessage.userId = this.botUserId;
      agentMessage.message = agentResponse;
      agentMessage.createdAt = new Date();
      
      this.messages.push(agentMessage);
      this.shouldScrollToBottom = true;
    }, 1000 + Math.random() * 2000); 
  }

  private generateAgentResponse(userMessage: string): string {
    const responses = [
      'Entiendo tu consulta. ¿Podrías proporcionarme más detalles?',
      'Gracias por tu mensaje. Estoy aquí para ayudarte con tus compras.',
      'Me parece una excelente pregunta. Te ayudo a resolverla.',
      'Perfecto, voy a revisar esa información para ti.',
      'Comprendo. ¿Hay algo específico que necesites sobre este tema?',
      'Muy bien, te voy a asistir con eso ahora mismo.',
      'Interesante punto. Déjame buscar la mejor solución para ti.'
    ];
    
    // Respuestas más específicas basadas en palabras clave
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
      return 'Te puedo ayudar con información sobre precios. ¿Qué producto te interesa?';
    }
    
    if (lowerMessage.includes('producto') || lowerMessage.includes('comprar')) {
      return 'Perfecto, te ayudo con tu compra. ¿Podrías decirme qué producto buscas?';
    }
    
    if (lowerMessage.includes('orden') || lowerMessage.includes('pedido')) {
      return 'Te ayudo con tu orden. ¿Necesitas crear una nueva o revisar una existente?';
    }
    
    if (lowerMessage.includes('gracias') || lowerMessage.includes('gracias')) {
      return '¡De nada! Es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?';
    }
    
    // Respuesta aleatoria si no hay palabras clave específicas
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isUserMessage(message: Message): boolean {
    return message.userId === this.currentUserId;
  }

  isAgentMessage(message: Message): boolean {
    return message.userId === this.botUserId;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
