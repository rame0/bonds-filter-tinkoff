export default function addMetrika(metrikaId: string) {
  window['ym'] =
    window['ym'] ||
    function () {
      ;(window['ym'].a = window['ym'].a || []).push(arguments)
    }
  // @ts-ignore
  window['ym'].l = 1 * new Date()

  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  script.async = true
  document.head.appendChild(script)

  const noscript = document.createElement('noscript')
  noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${metrikaId}" style="position:absolute; left:-9999px;" alt="" /></div>`
  document.body.appendChild(noscript)

  // initMetrika(metrikaId)
  //
  // // -- init script
  // const script2 = document.createElement('script');
  // script2.type = 'text/javascript';
  // script2.innerHTML = `
  //     ym(${metrikaId}, "init", {
  //     clickmap:true,
  //     trackLinks:true,
  //     accurateTrackBounce:true
  //   });
  // `;
  // document.body.appendChild(script2);
  // // -- end of init script
  //
  // // check if ym is defined in window and then run init script
  // if (typeof window.ym !== 'undefined') {
    window.ym(metrikaId, 'init', {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true
    });
  // }else{
  //   // if not defined, wait for 100ms and try again
  //   setTimeout(addMetrika, 100);
  // }
}

function initMetrika(metrikaId: string) {
  // check if ym is defined in window and then run init script
  if (typeof window.ym !== 'undefined') {
    window.ym(metrikaId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true
    })
  } else {
    // if not defined, wait for 100ms and try again
    setTimeout(initMetrika, 100)
    console.log('waiting')
  }
}
