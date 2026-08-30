# CuraFamília

[![CI](https://github.com/ninex9x/cura-family/actions/workflows/ci.yml/badge.svg)](https://github.com/ninex9x/cura-family/actions/workflows/ci.yml)
[![Protegido por Gitleaks](https://img.shields.io/badge/protected%20by-gitleaks-blue)](https://github.com/gitleaks/gitleaks)
[![Execução local](https://img.shields.io/badge/runtime-local--only-075fab)](#execução-local)

Aplicação para organizar familiares, medicamentos, horários, registros de doses e documentos de saúde. A mesma experiência React atende ao navegador e ao aplicativo Android empacotado em uma `WebView`.

> [!IMPORTANT]
> O código-fonte é público para demonstração técnica e portfólio, mas o aplicativo é exclusivamente local. Não existe demonstração hospedada, backend público ou ambiente de produção. Os dados incluídos no repositório são fictícios.

## Principais recursos

- agenda diária de medicamentos por familiar;
- registro de doses tomadas ou não tomadas;
- catálogo de medicamentos, apresentações e regras de uso;
- histórico pesquisável e paginado;
- documentos de saúde com visualização de PDFs;
- scanner multipágina no Android;
- armazenamento criptografado no backend local e no Android;
- interface responsiva compartilhada entre web e mobile.

## Execução local

### Requisitos

- Node.js `>=22.13.0` — Node 24 LTS recomendado;
- Java e Android SDK compatíveis com Android 34, apenas para gerar o APK.

Instale exatamente as dependências do lockfile e inicie o servidor:

```bash
npm ci
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`. O servidor aceita conexões somente em `127.0.0.1`.

Na primeira execução, `scripts/dev.mjs` cria uma chave aleatória em `.dev.vars`, restringe o arquivo ao usuário atual e não mostra o valor no terminal. O arquivo é ignorado pelo Git; `.dev.vars.example` documenta somente o formato esperado.

### Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia interface e API local |
| `npm start` | Atalho para o mesmo servidor local |
| `npm run typecheck` | Verifica os tipos TypeScript |
| `npm run lint` | Executa a análise estática |
| `npm test` | Compila o app web e executa os testes |
| `npm run build:mobile` | Gera os arquivos web usados pelo Android |
| `npm run android:apk` | Gera o APK de depuração no Windows |

## Arquitetura

```text
app/                 interface e API local
├── api/state/       persistência GET/PUT
└── page.tsx         experiência principal
db/                  schema e acesso ao D1 local
lib/                 validação e criptografia compartilhadas
worker/              entrada Vinext/Cloudflare do servidor local
mobile/              entrada Vite reutilizada pelo Android
android/             WebView, scanner e armazenamento nativo
tests/               renderização, validação e criptografia
```

O binding D1 `DB` é simulado localmente pelo plugin do Cloudflare. A tabela é criada de forma idempotente; não há banco ou credencial de produção no repositório.

## Persistência e segurança

### Navegador local

`GET /api/state` devolve o snapshot familiar e sua revisão. `PUT /api/state` valida tipos, tamanhos, formatos e relacionamentos antes de salvar. Atualizações concorrentes recebem `409`, escritas exigem mesma origem e hosts não locais recebem `403`.

O snapshot é criptografado com AES-256-GCM usando `LOCAL_DATA_ENCRYPTION_KEY`. Instalações antigas podem ser migradas uma vez do `localStorage`; a cópia anterior é removida somente depois da persistência segura.

### Android

O APK funciona offline. Estado, fotos incorporadas e PDFs digitalizados são criptografados por uma chave AES não exportável do Android Keystore. O backup do aplicativo é desabilitado, documentos antigos são migrados e a WebView bloqueia navegação, conteúdo misto e recursos fora de `app.local`.

## Dados de demonstração

A primeira execução apresenta uma família e medicamentos fictícios para tornar os fluxos verificáveis sem dados reais. Não use capturas de tela, commits, issues ou pull requests contendo informações pessoais ou médicas verdadeiras.

## Qualidade e segurança do repositório

Cada push e pull request executa:

- instalação reproduzível com `npm ci`;
- typecheck, lint, testes e build web;
- build dos recursos mobile;
- varredura completa do histórico com Gitleaks.

Vulnerabilidades devem ser relatadas de forma privada conforme [SECURITY.md](SECURITY.md). Orientações para contribuições estão em [CONTRIBUTING.md](CONTRIBUTING.md).

## Limitações conhecidas

- não há sincronização entre dispositivos ou contas;
- não há autenticação multiusuário;
- o projeto não deve ser implantado em hospedagem pública;
- o app auxilia a organização e não substitui orientação médica.

## Licença

Este repositório não possui licença de código aberto. Sua publicação permite visualização e avaliação do projeto, mas não concede permissão automática para copiar, modificar ou redistribuir o código.
