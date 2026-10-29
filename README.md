# Marvel Games (v1.4.0)

_© PROJETO ACADÊMICO SEM FINS LUCRATIVOS E/OU COM LIGAÇÃO ÀS PROPRIEDADES DISNEY._

## Demo Online

A aplicação está disponível para acesso em:
[https://marvelgames.vercel.app/](https://marvelgames.vercel.app/)

---

## Sobre o Projeto

**Marvel Games** é uma aplicação web desenvolvida para catalogar e apresentar jogos baseados no universo Marvel. A plataforma disponibiliza recursos de pesquisa por título, filtragem por plataformas e categorias, consulta de trailers e acesso às páginas dos jogos na PlayStation Store.

O projeto utiliza uma arquitetura **Jamstack**, na qual o front-end consome um arquivo JSON estático (`jogos.json`) para carregar e apresentar os dados. Essa abordagem dispensa a necessidade de um servidor de banco de dados em execução para o funcionamento da aplicação.

---

## Funcionalidades

- **Pesquisa por título:** localização de jogos por meio de consultas textuais.
- **Filtros:** organização do catálogo por plataforma, categoria e gênero.
- **Integração com YouTube:** acesso a trailers oficiais dos jogos.
- **Integração com PlayStation Store:** links para as respectivas páginas de compra.
- **Seção de destaques:** apresentação de títulos selecionados do catálogo.
- **Interface responsiva:** adaptação do layout para diferentes resoluções e dispositivos.

---

## Tecnologias Utilizadas

- Front-end: HTML5, CSS3 e JavaScript (ES6+).
- Estrutura de dados: JSON (`jogos.json`).
- Documentação: OpenAPI 3.0.3 (Swagger).
- Hospedagem: [Vercel](https://vercel.com/).


---

## Estrutura de Arquivos

```text
.
├── docs/
│   └── openapi.yaml     # Especificação OpenAPI 3.0.3
├── index.html           # Estrutura da interface
├── style.css            # Estilos e layout
├── app.js               # Lógica de aplicação e manipulação dos dados
└── jogos.json           # Catálogo estático de jogos
```

_© PROJETO ACADÊMICO SEM FINS LUCRATIVOS E/OU COM LIGAÇÃO ÀS PROPRIEDADES DISNEY._
