import * as WebSocket from 'ws';
import * as constants from '@synesthesia-project/core/constants';
import { DownstreamEndpoint, messages } from '@synesthesia-project/core/protocols/broadcast';
import { CueFile } from '@synesthesia-project/core/file';

export type StateListener = (state: messages.PlayStateData | null, getFile: (hash: string) => Promise<CueFile>) => void;

// TODO: reimplement incoming connections
// export class SynesthesiaConsumerServer {
//   public constructor(stateUpdated: StateListener) {
//     const wss = new WebSocket.Server({
//       perMessageDeflate: false,
//       port: constants.DEFAULT_SYNESTHESIA_PORT
//     });

//     wss.on('connection', connection => {
//       const url = connection.upgradeReq.url;
//       if (url === constants.) {
//         const proto = new SynesthesiaConsumerProtocol(connection, stateUpdated);
//         return;
//       }
//       console.error('unrecognized websocket url: ', url);
//       connection.close();
//     });
//   }
// }

export class SynesthesiaListener {

  private readonly stateUpdated: StateListener;

  public constructor(stateUpdated: StateListener) {
    this.stateUpdated = stateUpdated;
  }

  public connectToServer() {
    const ws = new WebSocket(`ws://localhost:${constants.DEFAULT_SYNESTHESIA_PORT}/listen`);
    ws.addEventListener('open', () => {
      const endpoint = new DownstreamEndpoint(
        msg => ws.send(JSON.stringify(msg)),
        state => {
          console.log('new state', state);
          this.stateUpdated(state, getFile);
        }
      );
      const getFile = endpoint.getFile.bind(endpoint);
      ws.addEventListener('message', msg => {
        endpoint.recvMessage(JSON.parse(msg.data));
      });
    });
    ws.addEventListener('error', err => {
      // TODO
      console.error(err);
    });
    ws.addEventListener('close', _err => {
      // TODO
    });

  }
}

