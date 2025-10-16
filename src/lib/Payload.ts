export type PayloadType = "message" | "handshake" | "ping" | "upgrade" | "frame"

export type FrameData = Record<string, any>
export type PayloadMsgData = {
  group: "client-action" | "server-response",
  name: string,
  status?: number,
  data?: any
}

export class Payload<T extends any = any> {
  protected _data: T;
  private _type: string;

  constructor(type: PayloadType, data: T)
  constructor(raw_message: string)

  constructor(...args: any[]) {
    if (args.length === 1) {
      const raw_message = args[0]
      const payload = JSON.parse(raw_message)
      if (!payload.type) {
        throw new Error("invalid payload")
      }
      this._data = payload.data
      this._type = payload.type
    } else {
      this._data = args[1]
      this._type = args[0]
    }
  }

  public getData(): T {
    return this._data;
  }

  public isMessage() {
    return this._type === "message"
  }

  public getType() {
    return this._type;
  }

  public serialize() {
    return JSON.stringify({type: this._type, data: this._data})
  }
}

export class MsgPayload extends Payload<PayloadMsgData> {
  constructor(data: PayloadMsgData) {
    super("message", data);
  }

  public isClientAction() {
    return this._data.group === "client-action"
  }

  public isServerResponse() {
    return this._data.group === "server-response"
  }

  public getGroup() {
    return this._data.group
  }

  public getName() {
    return this._data.name
  }

  public getStatus() {
    return this._data.status
  }

  public isError() {
    return this._data.status ? this._data.status > 0 : true
  }

  // override
  public getData() {
    return this._data.data
  }
}

export class FramePayload extends Payload<FrameData | "EOF" | "SOF"> {
  constructor(frame: FrameData | "EOF" | "SOF") {
    super("frame", frame);
  }

  public getFrame() {
    return this._data
  }

  public isEOFrame() {
    return this._data === "EOF"
  }

  public isSOFrame() {
    return this._data === "SOF"
  }
}