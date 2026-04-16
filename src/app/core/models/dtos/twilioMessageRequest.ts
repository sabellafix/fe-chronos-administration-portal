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
        this.SmsMessageSid = 'SM079ad2bf3836f265befbb6d462447a5c';
        this.NumMedia = '0';
        this.SmsSid = 'SM079ad2bf3836f265befbb6d462447a';
        this.SmsStatus = 'received';
        this.Body = body;
        this.FromCountry = 'CO';
        this.To = '+19137285498';
        this.NumSegments = '1';
        this.MessageSid = 'SM079ad2bf3836f265befbb6d462447a5c';
        this.AccountSid = 'AC4c808d46b875111e8dce87edad64dea2';
        this.From = '+573104453912';
        this.ApiVersion = '2010-04-01';
    }
}