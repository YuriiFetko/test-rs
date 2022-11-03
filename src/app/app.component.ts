import {Component} from '@angular/core';
import {IdentitySerializer, JsonSerializer, RSocketClient} from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  client: RSocketClient<any, any> | undefined;
  channel = 'my.time-updates.stream';

  constructor() {
  }

  ngOnInit(): void {

    this.client = new RSocketClient({
      serializers: {
        data: JsonSerializer,
        metadata: IdentitySerializer
      },
      setup: {
        keepAlive: 60000,
        lifetime: 180000,
        dataMimeType: 'application/json',
        metadataMimeType: 'message/x.rsocket.routing.v0',
      },
      transport: new RSocketWebSocketClient({
        url: 'ws://localhost:8080/rsocket'
      }),
    });

    this.client.connect().subscribe({
      onComplete: (socket) => {
        socket
          .requestStream({
            data: null,
            metadata: String.fromCharCode(this.channel.length) + this.channel
          })
          .subscribe({
            onComplete: () => console.log('complete'),
            onError: (error) => {
              console.log('Connection has been closed due to:: ' + error);
            },
            onNext: (payload) => {
              console.log(payload);
            },
            onSubscribe: (subscription: { request: (arg0: number) => void; }) => {
              subscription.request(1000000);
            },
          });
      },
      onError: (error) => {
        console.log('Connection has been refused due to:: ' + error);
      },
      onSubscribe: () => {
      }
    });
  }
}
