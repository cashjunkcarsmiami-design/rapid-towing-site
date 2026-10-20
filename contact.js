(() => {
  if(window.rapidContactReady)return;
  window.rapidContactReady=true;
  const track=(event,details={})=>{
    if(typeof window.gtag==='function')window.gtag('event',event,{
      event_category:'contact',event_label:location.pathname,source_page:location.pathname,
      site_name:'Rapid Towing',transport_type:'beacon',...details
    });
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(!link)return;
    const url=new URL(link.href,location.href);
    const method=url.protocol==='tel:'?'phone':url.hostname==='wa.me'?'whatsapp':url.protocol==='mailto:'?'email':null;
    if(!method)return;
    track(method+'_click',{contact_method:method,contact_placement:link.closest('.sticky-mobile-actions')?'sticky':link.closest('header')?'header':link.closest('footer')?'footer':'content'});
  });
  document.querySelectorAll('form[data-rapid-request]').forEach(form=>{
    const button=form.querySelector('button[type="submit"]');
    const status=document.createElement('p');
    status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    button.after(status);
    let available=false,sending=false,started=false;
    fetch('/api/contact',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{}).then(result=>{
      if(result.available===true){
        available=true;
        button.textContent='Send request by email';
        const note=form.querySelector('[data-request-note]');
        if(note)note.textContent='Send your details to Rapid Towing by email. For urgent help, call 305-457-0817. A request is not a confirmed booking.';
      }
    }).catch(()=>{});
    form.addEventListener('input',()=>{
      if(!started){started=true;track('request_start',{contact_method:'form'});}
    });
    const prepareWhatsApp=data=>{
      const message=['Rapid Towing service request',
        'Name: '+data.get('name'),'Phone: '+data.get('phone'),
        'Pickup: '+data.get('pickup'),'Destination: '+(data.get('dropoff')||'Please discuss'),
        'Vehicle / issue: '+data.get('message')].join('\n');
      status.replaceChildren();
      const note=document.createElement('p');
      note.textContent='Your message is prepared. Open WhatsApp, review it and press Send. Nothing is booked until dispatch confirms.';
      const link=document.createElement('a');
      link.textContent='Open prepared WhatsApp message';
      link.href='https://wa.me/13054570817?text='+encodeURIComponent(message);
      link.className='btn whatsapp';link.target='_blank';link.rel='noopener';
      status.append(note,link);
      track('whatsapp_draft_prepared',{contact_method:'whatsapp'});
    };
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(sending)return;
      const phone=form.elements.namedItem('phone');
      const digits=phone.value.replace(/\D/g,'');
      phone.setCustomValidity(/^[+0-9 ().-]+$/.test(phone.value)&&
        (digits.length===10||(digits.length===11&&digits[0]==='1'))?'':'Enter a valid 10-digit phone number. / Ingresa un teléfono válido de 10 dígitos.');
      if(!form.reportValidity())return;
      const data=new FormData(form);
      if(!available){prepareWhatsApp(data);return;}
      sending=true;button.disabled=true;
      status.textContent='Sending your request… / Enviando tu solicitud…';
      data.set('source_page',location.pathname);
      track('request_submit_attempt',{contact_method:'form'});
      try{
        const response=await fetch('/api/contact',{method:'POST',headers:{Accept:'application/json'},body:new URLSearchParams(data),signal:AbortSignal.timeout(18000)});
        const result=await response.json();
        if(!response.ok||result.accepted!==true)throw Error('unconfirmed');
        track('generate_lead',{contact_method:'form'});
        location.assign('/thank-you.html');
      }catch{
        track('request_submit_error',{contact_method:'form'});
        prepareWhatsApp(data);
        status.prepend(document.createTextNode('Email delivery could not be confirmed. Please call before retrying, or use WhatsApp below. '));
        button.disabled=false;sending=false;
      }
    });
    form.elements.namedItem('phone').addEventListener('input',()=>form.elements.namedItem('phone').setCustomValidity(''));
    window.addEventListener('pageshow',()=>{sending=false;button.disabled=false;});
  });
})();
