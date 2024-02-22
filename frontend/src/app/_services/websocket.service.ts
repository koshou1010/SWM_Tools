import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = new WebSocketSubject('ws://127.0.0.1:8000/ws/websocket_demo/');
  }

  sendMessage(message: any): void {
    this.socket$.next(message);
  }

  getMessage(): WebSocketSubject<any> {
    return this.socket$;
  }
}
