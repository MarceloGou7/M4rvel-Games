let todosOsJogos = []

const normalizarCategorias = jogo => {
  if (Array.isArray(jogo.categoria)) return jogo.categoria.filter(Boolean)
  if (typeof jogo.categoria === 'string' && jogo.categoria.trim()) {
    return [jogo.categoria.trim()]
  }
  return []
}

const criarSlug = texto =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

document.addEventListener('DOMContentLoaded', () => {
  iniciarIntroducao()
  carregarJogos()
  configurarEventos()
})

function iniciarIntroducao() {
  const tela = document.getElementById('tela-introducao')
  const video = document.getElementById('video-introducao')

  if (!tela || !video) return

  document.body.classList.add('bloquear-site')

  const liberarSite = () => {
    if (tela.classList.contains('encerrada')) return

    tela.classList.add('encerrando')
    document.body.classList.remove('bloquear-site')

    window.setTimeout(() => {
      tela.classList.add('encerrada')
      video.pause()
      video.removeAttribute('src')
      video.load()
    }, 850)
  }

  video.addEventListener('ended', liberarSite, { once: true })
  video.addEventListener('error', liberarSite, { once: true })

  const iniciarReproducao = video.play()
  if (iniciarReproducao && typeof iniciarReproducao.catch === 'function') {
    iniciarReproducao.catch(() => {
      const retomar = () => {
        video.play().catch(() => {})
        window.removeEventListener('pointerdown', retomar)
        window.removeEventListener('keydown', retomar)
      }
      window.addEventListener('pointerdown', retomar, { once: true })
      window.addEventListener('keydown', retomar, { once: true })
    })
  }
}

async function carregarJogos() {
  try {
    const resposta = await fetch('jogos.json', { cache: 'no-store' })
    if (!resposta.ok) throw new Error('Não foi possível carregar o catálogo.')

    const dados = await resposta.json()
    if (!Array.isArray(dados))
      throw new Error('O arquivo jogos.json deve conter uma lista de jogos.')

    todosOsJogos = dados.map(jogo => ({
      ...jogo,
      categoria: normalizarCategorias(jogo),
      plataformas: Array.isArray(jogo.plataformas) ? jogo.plataformas : [],
      generos: Array.isArray(jogo.generos) ? jogo.generos : []
    }))

    iniciarDestaque(todosOsJogos)
    renderizarCatalogo(todosOsJogos)
  } catch (erro) {
    console.error('Erro ao carregar o catálogo:', erro)

    const container = document.getElementById('categorias-container')
    if (container) {
      container.innerHTML = `
        <div class="sem-resultados">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Não foi possível carregar o catálogo.</p>
        </div>
      `
    }
  }
}

function iniciarDestaque(jogos) {
  const jogoDestaque = jogos.find(jogo => jogo.destaque) || jogos[0]
  if (!jogoDestaque) return

  document.getElementById('imagem-destaque').style.backgroundImage =
    `url('${jogoDestaque.imagemDestaque || jogoDestaque.capa}')`

  document.getElementById('titulo-destaque').textContent = jogoDestaque.titulo
  document.getElementById('descricao-destaque').textContent =
    jogoDestaque.descricao

  document.getElementById('metadados-destaque').innerHTML = `
    <span class="metadado"><i class="fa-regular fa-calendar"></i>${jogoDestaque.ano}</span>
    <span class="metadado"><i class="fa-solid fa-building"></i>${jogoDestaque.desenvolvedora}</span>
    <span class="metadado"><i class="fa-solid fa-star"></i>${jogoDestaque.avaliacao}</span>
  `

  const botaoComprar = document.getElementById('botao-detalhes')
  botaoComprar.textContent = 'Comprar'
  botaoComprar.onclick = () => abrirPSN(jogoDestaque)

  document.getElementById('botao-trailer').onclick = () =>
    abrirModal(jogoDestaque)
}

function abrirPSN(jogo) {
  if (!jogo.urlPSN) {
    console.warn(
      `Nenhuma página da PlayStation Store cadastrada para: ${jogo.titulo}`
    )
    return
  }

  window.open(jogo.urlPSN, '_blank', 'noopener,noreferrer')
}

function renderizarCatalogo(jogos) {
  const container = document.getElementById('categorias-container')
  const contador = document.getElementById('contador-catalogo')

  container.innerHTML = ''
  contador.innerHTML = `<strong>${jogos.length}</strong> ${jogos.length === 1 ? 'título encontrado' : 'títulos encontrados'}`

  if (jogos.length === 0) {
    container.innerHTML = `
      <div class="sem-resultados">
        <i class="fa-solid fa-ghost"></i>
        <p>Nenhum jogo encontrado com os filtros selecionados.</p>
      </div>
    `
    return
  }

  const mapaCategorias = new Map()

  jogos.forEach(jogo => {
    normalizarCategorias(jogo).forEach(categoria => {
      if (!mapaCategorias.has(categoria)) mapaCategorias.set(categoria, [])
      mapaCategorias.get(categoria).push(jogo)
    })
  })

  mapaCategorias.forEach((jogosDaCategoria, nomeCategoria) => {
    const grupo = document.createElement('section')
    grupo.className = `categoria-grupo categoria-${criarSlug(nomeCategoria)}`

    const identificadorSeguro = `galeria-${criarSlug(nomeCategoria)}`

    grupo.innerHTML = `
      <h3 class="titulo-categoria">${nomeCategoria}</h3>
      <div class="galeria-jogos" id="${identificadorSeguro}" aria-label="${nomeCategoria}"></div>
    `

    container.appendChild(grupo)

    const galeria = grupo.querySelector('.galeria-jogos')
    jogosDaCategoria.forEach(jogo => galeria.appendChild(criarCartaoJogo(jogo)))

    configurarNavegacaoGaleria(galeria)
  })
}

function configurarNavegacaoGaleria(galeria) {
  const grupo = galeria.closest('.categoria-grupo')
  if (!grupo) return

  const atualizarSetas = () => {
    const podeVoltar = galeria.scrollLeft > 8
    const podeAvancar =
      galeria.scrollLeft + galeria.clientWidth < galeria.scrollWidth - 8

    grupo.classList.toggle('tem-itens-esquerda', podeVoltar)
    grupo.classList.toggle('tem-mais-itens', podeAvancar)
  }

  const setaEsquerda = document.createElement('button')
  setaEsquerda.type = 'button'
  setaEsquerda.className = 'seta-galeria seta-esquerda'
  setaEsquerda.setAttribute('aria-label', 'Voltar jogos')
  setaEsquerda.innerHTML = '<i class="fa-solid fa-chevron-left"></i>'

  const setaDireita = document.createElement('button')
  setaDireita.type = 'button'
  setaDireita.className = 'seta-galeria seta-direita'
  setaDireita.setAttribute('aria-label', 'Mostrar mais jogos')
  setaDireita.innerHTML = '<i class="fa-solid fa-chevron-right"></i>'

  const rolarGaleria = direcao => {
    const primeiroItem = galeria.querySelector('.item-jogo')
    const distancia = primeiroItem
      ? primeiroItem.getBoundingClientRect().width + 16
      : galeria.clientWidth * 0.82

    galeria.scrollBy({ left: distancia * 2 * direcao, behavior: 'smooth' })
  }

  setaEsquerda.addEventListener('click', () => rolarGaleria(-1))
  setaDireita.addEventListener('click', () => rolarGaleria(1))

  grupo.appendChild(setaEsquerda)
  grupo.appendChild(setaDireita)

  galeria.addEventListener('scroll', atualizarSetas, { passive: true })
  window.addEventListener('resize', atualizarSetas)
  requestAnimationFrame(atualizarSetas)
}

function criarCartaoJogo(jogo) {
  const item = document.createElement('div')
  item.className = 'item-jogo'

  const cartao = document.createElement('article')
  cartao.className = 'cartao-jogo'
  cartao.setAttribute('tabindex', '0')
  cartao.setAttribute('aria-label', `Ver detalhes de ${jogo.titulo}`)

  cartao.onclick = () => abrirModal(jogo)
  cartao.onkeydown = evento => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault()
      abrirModal(jogo)
    }
  }

  const plataformas = jogo.plataformas
    .map(plataforma => `<span class="etiqueta-plataforma">${plataforma}</span>`)
    .join('')

  cartao.innerHTML = `
    <div class="poster-jogo">
      <img src="${jogo.capa}" alt="${jogo.titulo}" loading="lazy">
    </div>
    <div class="info-jogo">
      <h4 class="titulo-jogo">${jogo.titulo}</h4>
      <div class="plataformas-jogo">${plataformas}</div>
    </div>
  `

  const botaoComprar = document.createElement('button')
  botaoComprar.type = 'button'
  botaoComprar.className = 'botao-comprar-card'
  botaoComprar.innerHTML =
    '<i class="fa-solid fa-cart-shopping"></i><span>Comprar</span>'
  botaoComprar.setAttribute(
    'aria-label',
    `Comprar ${jogo.titulo} na PlayStation Store`
  )
  botaoComprar.disabled = !jogo.urlPSN

  botaoComprar.addEventListener('click', evento => {
    evento.stopPropagation()
    abrirPSN(jogo)
  })

  item.appendChild(cartao)
  item.appendChild(botaoComprar)

  return item
}

function filtrarJogos() {
  const termo = document
    .getElementById('campo-busca')
    .value.toLowerCase()
    .trim()
  const plataforma = document.getElementById('filtro-plataforma').value

  const filtrados = todosOsJogos.filter(jogo => {
    const categorias = normalizarCategorias(jogo).join(' ')
    const correspondeTexto =
      String(jogo.titulo || '')
        .toLowerCase()
        .includes(termo) ||
      categorias.toLowerCase().includes(termo) ||
      String(jogo.desenvolvedora || '')
        .toLowerCase()
        .includes(termo)

    const correspondePlataforma =
      plataforma === 'TODAS' || jogo.plataformas.includes(plataforma)

    return correspondeTexto && correspondePlataforma
  })

  renderizarCatalogo(filtrados)
}

function configurarEventos() {
  document.getElementById('campo-busca').addEventListener('input', filtrarJogos)
  document
    .getElementById('filtro-plataforma')
    .addEventListener('change', filtrarJogos)

  const modal = document.getElementById('modal-jogo')
  const botaoFechar = document.getElementById('botao-fechar-modal')

  botaoFechar.onclick = fecharModal

  modal.onclick = evento => {
    if (evento.target === modal) fecharModal()
  }

  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape') fecharModal()
  })
}

function abrirModal(jogo) {
  const modal = document.getElementById('modal-jogo')

  document.getElementById('titulo-modal').textContent = jogo.titulo
  document.getElementById('categoria-modal').textContent =
    normalizarCategorias(jogo).join(' • ')
  document.getElementById('avaliacao-modal').innerHTML =
    `<i class="fa-solid fa-star"></i> ${jogo.avaliacao}`
  document.getElementById('desenvolvedora-modal').textContent =
    jogo.desenvolvedora
  document.getElementById('ano-modal').textContent = jogo.ano
  document.getElementById('generos-modal').textContent = jogo.generos.join(', ')
  document.getElementById('plataformas-modal').textContent =
    jogo.plataformas.join(', ')
  document.getElementById('descricao-modal').textContent = jogo.descricao

  const video = document.getElementById('video-modal')
  video.src = jogo.trailer
    ? `${jogo.trailer}${jogo.trailer.includes('?') ? '&' : '?'}autoplay=1`
    : ''

  modal.classList.add('ativo')
  modal.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
}

function fecharModal() {
  const modal = document.getElementById('modal-jogo')
  const video = document.getElementById('video-modal')

  modal.classList.remove('ativo')
  modal.setAttribute('aria-hidden', 'true')
  video.src = ''
  document.body.style.overflow = ''
}
