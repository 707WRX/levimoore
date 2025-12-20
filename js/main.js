/* Levi Moore — interactions (drawer, reveal, glass glow, smooth scroll, contact form) */
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Mobile drawer
  const drawer = $("#drawer");
  const openBtn = $("#burger");
  const closeBtn = $("#drawerClose");
  const backdrop = $("#drawerBackdrop");

  function setDrawer(open){
    if(!drawer) return;
    drawer.classList.toggle("is-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
  }
  openBtn?.addEventListener("click", ()=>setDrawer(true));
  closeBtn?.addEventListener("click", ()=>setDrawer(false));
  backdrop?.addEventListener("click", ()=>setDrawer(false));
  $$("#drawer a").forEach(a => a.addEventListener("click", ()=>setDrawer(false)));

  // Smooth scroll for same-page anchors
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener("click",(e)=>{
      const id = a.getAttribute("href");
      if(!id || id.length < 2) return;
      const el = document.querySelector(id);
      if(!el) return;
      e.preventDefault();
      el.scrollIntoView({behavior:"smooth", block:"start"});
      history.replaceState(null, "", id);
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting) en.target.classList.add("is-in");
    });
  }, {threshold: 0.12});
  $$(".reveal").forEach(el=>io.observe(el));

  // Glass glow pointer effect (mx/my)
  const glassEls = $$(".glass");
  function bindGlow(el){
    let raf = 0;
    const onMove = (ev)=>{
      const rect = el.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        el.style.setProperty("--mx", x.toFixed(2) + "%");
        el.style.setProperty("--my", y.toFixed(2) + "%");
        el.classList.add("is-hot");
      });
    };
    const onLeave = ()=>{
      el.classList.remove("is-hot");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  }
  glassEls.forEach(bindGlow);

  // Magnetic buttons (subtle)
  function bindMagnetic(btn){
    let raf=0;
    btn.addEventListener("pointermove",(e)=>{
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        btn.style.transform = `translate(${dx*6}px, ${dy*6}px)`;
      });
    });
    btn.addEventListener("pointerleave",()=>{
      btn.style.transform = "";
    });
  }
  $$(".btn").forEach(bindMagnetic);

  // Contact form (Resend via /api/contact)
  const form = $("#contactForm");
  const status = $("#formStatus");
  async function postJSON(url, data){
    const res = await fetch(url, {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(data)
    });
    const out = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(out?.error || "Request failed");
    return out;
  }
  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if(!status) return;

    const fd = new FormData(form);
    // honeypot
    if((fd.get("company") || "").toString().trim().length){
      status.classList.add("is-show");
      status.textContent = "Thanks — message received.";
      form.reset();
      return;
    }

    const payload = {
      name: (fd.get("name")||"").toString().trim(),
      email: (fd.get("email")||"").toString().trim(),
      phone: (fd.get("phone")||"").toString().trim(),
      intent: (fd.get("intent")||"").toString().trim(),
      message: (fd.get("message")||"").toString().trim(),
      source: window.location.pathname
    };

    status.classList.add("is-show");
    status.textContent = "Sending…";

    const btn = $("#submitBtn");
    if(btn) btn.disabled = true;

    try{
      await postJSON("/api/contact", payload);
      status.textContent = "Sent. Levi will get back to you shortly.";
      form.reset();
    }catch(err){
      status.textContent = "Could not send right now. Please try again in a minute.";
      console.error(err);
    }finally{
      if(btn) btn.disabled = false;
    }
  });

})();
