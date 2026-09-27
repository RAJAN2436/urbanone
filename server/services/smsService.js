// SMS Dispatcher Service (Twilio Real-Time Telecom Gateway with Resilient Fallback)

export const dispatchTwilioSms = async (cleanPhone, otpCode) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const rawFrom = process.env.TWILIO_PHONE_NUMBER;
  let fromNumber = rawFrom ? rawFrom.trim() : null;
  if (fromNumber && !fromNumber.startsWith('+') && /^\d+$/.test(fromNumber)) {
    fromNumber = fromNumber.length === 10 ? `+91${fromNumber}` : `+${fromNumber}`;
  }
  const formattedTo = `+91${cleanPhone}`;
  const messageBody = `Your KalsenOne verification code is ${otpCode}. Valid for 5 minutes. Do not share this OTP with anyone. - KALSEN USHAIT`;

  console.log(`=======================================================`);
  console.log(`📲 [TWILIO SMS GATEWAY DISPATCH]`);
  console.log(`To Mobile: ${formattedTo}`);
  console.log(`From Twilio: ${fromNumber || '(Not configured in .env)'}`);
  console.log(`OTP Code: [${otpCode}]`);
  console.log(`Time: ${new Date().toLocaleTimeString()} | Status: DISPATCHING`);
  console.log(`=======================================================`);

  if (accountSid && authToken && fromNumber && accountSid !== 'your_twilio_account_sid_here') {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams({
        To: formattedTo,
        From: fromNumber,
        Body: messageBody
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();
      console.log(`[Twilio Live Response]: SID: ${data.sid || 'N/A'}, Status: ${data.status || data.message || data.code}`);

      if (response.ok && data.sid) {
        console.log(`[Twilio] ✅ Live SMS dispatched successfully to ${formattedTo}! (Message SID: ${data.sid})`);
        return {
          delivered: true,
          liveDelivered: true,
          provider: 'Twilio',
          senderId: fromNumber,
          phone: formattedTo,
          messageSid: data.sid,
          template: messageBody,
          gatewayResponse: data
        };
      } else {
        console.warn(`[Twilio Notice (${data.code})]: ${data.message}`);
        return {
          delivered: true,
          liveDelivered: false,
          provider: 'Twilio',
          senderId: fromNumber,
          phone: formattedTo,
          error: data.message,
          errorCode: data.code,
          gatewayResponse: data
        };
      }
    } catch (err) {
      console.warn(`[Twilio Network Error]:`, err.message);
      return {
        delivered: true,
        liveDelivered: false,
        provider: 'Twilio',
        phone: formattedTo,
        error: err.message
      };
    }
  }

  return {
    delivered: true,
    liveDelivered: false,
    provider: 'Twilio (Add credentials in .env)',
    senderId: fromNumber || 'KALSEN',
    phone: formattedTo,
    template: messageBody
  };
};
