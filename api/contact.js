const recipient = 'rapid.towingmiami@gmail.com';
export default async function handler(req, res) {
  const ready = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL);
  const json = (status, value) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(value));
  };
  if (req.method === 'GET') return json(200, {available:ready});
  if (req.method !== 'POST') {
    res.setHeader('Allow','GET, POST');
    return json(405,{accepted:false});
  }
  const wantsJson = (req.headers.accept || '').includes('application/json');
  const fail = (status, message) => {
    if (wantsJson) return json(status,{accepted:false});
    res.statusCode=status;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact Rapid Towing</title><main><h1>Contact Rapid Towing</h1><p>${message}</p><p><a href="tel:+13054570817">Call 305-457-0817</a> or <a href="https://wa.me/13054570817">use WhatsApp</a>.</p><p><a href="/#contact">Return to the contact form</a></p></main></html>`);
  };
  let encoded;
  if(req.body!==undefined){
    encoded=typeof req.body==='string'?req.body:Buffer.isBuffer(req.body)?req.body.toString('utf8'):new URLSearchParams(req.body).toString();
  }else{
    let size=0, chunks=[];
    for await (const chunk of req) {
      size+=Buffer.byteLength(chunk);
      if(size>16000)return fail(413,'Your request is too long. Please call us.');
      chunks.push(Buffer.from(chunk));
    }
    encoded=Buffer.concat(chunks).toString('utf8');
  }
  if(Buffer.byteLength(encoded)>16000)return fail(413,'Your request is too long. Please call us.');
  const data=new URLSearchParams(encoded);
  if(data.get('bot-field'))return fail(400,'Please contact us directly.');
  const name=(data.get('name')||data.get('First Name')||'').trim();
  const phone=(data.get('phone')||data.get('Phone')||'').trim();
  const pickup=(data.get('pickup')||data.get('Pickup Location')||'').trim();
  const issue=(data.get('message')||data.get('Vehicle Problem')||'').trim();
  const destination=(data.get('dropoff')||'Not yet specified').trim();
  const digits=phone.replace(/\D/g,'');
  if(!name||name.length>100||!pickup||pickup.length>500||!issue||issue.length>3000||
    destination.length>500||!/^[+0-9 ().-]+$/.test(phone)||!(digits.length===10||(digits.length===11&&digits[0]==='1')))
    return fail(400,'Please provide your name, a valid US phone number, pickup location and vehicle details.');
  if(!ready)return fail(503,'Please call or use WhatsApp to request service.');
  const page=data.get('source_page')||'/';
  const source=/^\/[a-z0-9/_.-]*$/i.test(page)?page:'/';
  const text=[
    'Rapid Towing website request — confirm availability before dispatch.',
    `Name: ${name}`,`Phone: ${phone}`,`Pickup: ${pickup}`,`Destination: ${destination}`,
    `Vehicle / issue: ${issue}`,`Source page: ${source}`
  ].join('\n');
  try {
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:recipient,subject:'Rapid Towing — new website service request',text}),
      signal:AbortSignal.timeout(12000)
    });
    if(!response.ok)return fail(502,'We could not confirm delivery. Please call before retrying.');
  } catch {return fail(502,'We could not confirm delivery. Please call before retrying.');}
  if(wantsJson)return json(200,{accepted:true});
  res.writeHead(303,{Location:'/thank-you.html'});res.end();
}
