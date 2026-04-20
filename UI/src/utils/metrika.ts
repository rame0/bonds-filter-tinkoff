export default function addMetrika(metrikaId: string) {
  window.ym =
    window.ym ||
    function (...args: unknown[]) {
      ;(window.ym!.a = window.ym!.a || []).push(args)
    }
  window.ym.l = Date.now()

  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  script.async = true
  document.head.appendChild(script)

  const noscript = document.createElement('noscript')
  noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${metrikaId}" style="position:absolute; left:-9999px;" alt="" /></div>`
  document.body.appendChild(noscript)

  window.ym?.(metrikaId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true
  })
}
