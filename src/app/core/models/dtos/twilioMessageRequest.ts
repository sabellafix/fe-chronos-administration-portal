import { environment } from '@env/environment';

export class TwilioMessageRequest {
    ToCountry: string;
    ToState: string;
    SmsMessageSid: string;
    NumMedia: string;
    SmsSid: string;
    SmsStatus: string;
    Body: string;
    FromCountry: string;
    To: string;
    NumSegments: string;
    MessageSid: string;
    AccountSid: string;
    From: string;
    ApiVersion: string;

    constructor(body: string = 'Who are you?') {
        this.ToCountry = 'US';
        this.ToState = 'CA';
        this.NumMedia = '0';
        this.SmsStatus = 'received';
        this.Body = body;
        this.FromCountry = 'CO';
        this.To = '19137285498';
        this.NumSegments = '1';
        this.SmsMessageSid = environment.twilio.smsMessageSid;
        this.SmsSid = environment.twilio.smsSid;
        this.MessageSid = environment.twilio.messageSid;
        this.AccountSid = environment.twilio.accountSid;
        this.From = '573104453912';
        this.ApiVersion = '2010-04-01';
    }
}