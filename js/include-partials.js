// Simple include loader: load partial HTML into elements with `data-include` attribute
async function includePartials(){
  const nodes = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(nodes).map(async el => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url, {cache: 'no-store'});
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      el.innerHTML = await res.text();
    } catch(err){
      console.error('Failed to include', url, err);
    }
  }));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', includePartials);
} else {
  includePartials();
}
