import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch("https://mnsqbsxazooykgzmjzug.supabase.co/rest/v1/ghosts", {
      headers: {
        "apikey": "sb_publishable_taVUA5h2Gq_GIhs9A_NRrw_5i7S-Ncx",
        "Authorization": "Bearer sb_publishable_taVUA5h2Gq_GIhs9A_NRrw_5i7S-Ncx"
      }
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}

test();
