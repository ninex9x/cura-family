# CuraFamília

[![CI](https://github.com/ninex9x/cura-family/actions/workflows/ci.yml/badge.svg)](https://github.com/ninex9x/cura-family/actions/workflows/ci.yml)
[![Protegido por Gitleaks](https://img.shields.io/badge/protected%20by-gitleaks-blue)](https://github.com/gitleaks/gitleaks)
[![Execução local](https://img.shields.io/badge/runtime-local--only-cc0000)](#início-rápido)

Aplicação local-first para organizar familiares, medicamentos, horários,
registros de doses e documentos de saúde. A mesma experiência React atende ao
navegador local e ao aplicativo Android empacotado em uma WebView segura.

> [!IMPORTANT]
> O código-fonte é público para demonstração técnica e portfólio, mas a
> aplicação funciona exclusivamente no dispositivo local. Não existe demo,
> backend, banco ou ambiente de produção hospedado.

[Estudo de caso](docs/CASE_STUDY.md) ·
[Roadmap](docs/ROADMAP.md) ·
[Guia do projeto público](docs/GUIA_PROJETO_PUBLICO.md) ·
[Segurança](SECURITY.md) ·
[Baixar APK de teste](https://github.com/ninex9x/cura-family/releases/download/v1.0.3-test.1/CuraFamilia-1.0.3-android-debug.apk) ·
[Releases](https://github.com/ninex9x/cura-family/releases)

## Recursos

- agenda diária de medicamentos por familiar;
- registro de doses tomadas ou não tomadas;
- catálogo de medicamentos, apresentações e regras de uso;
- histórico pesquisável, filtrável e paginado;
- documentos de saúde com visualização de imagens e PDFs;
- scanner multipágina integrado ao Android;
- armazenamento cifrado no backend local e no Android;
- migração segura de instalações antigas;
- temas claro e escuro persistentes;
- interface responsiva compartilhada entre web e mobile.

## Início rápido

### Requisitos

- Node.js `22.13.0` ou superior — Node 24 recomendado;
- npm 10 ou superior;
- Git.

Clone, instale exatamente as dependências do lockfile e inicie:

```bash
git clone https://github.com/ninex9x/cura-family.git
cd cura-family
npm ci
npm run dev
```

O comando inicia a interface e a API somente no computador local. O endereço
correto é exibido pelo terminal durante a inicialização.

Na primeira execução, `scripts/dev.mjs` cria uma chave aleatória em `.dev.vars`
e restringe o arquivo ao usuário atual. O valor não aparece no terminal e o
arquivo é ignorado pelo Git. `.dev.vars.example` documenta apenas o formato.

O modo local:

- aceita conexões apenas do próprio dispositivo;
- mantém os dados na máquina do usuário;
- não exige conta ou autenticação externa;
- não envia informações para uma demonstração pública;
- utiliza dados fictícios até que o usuário cadastre os próprios perfis.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia a interface e a API locais |
| `npm start` | Inicia o mesmo ambiente local |
| `npm run typecheck` | Verifica os tipos TypeScript |
| `npm run lint` | Executa análise estática |
| `npm test` | Compila o app web e executa os testes |
| `npm run build:mobile` | Gera os recursos web do Android |
| `npm run android:apk` | Gera o APK de depuração no Windows |

## Arquitetura

```text
Navegador local
      └──> React / Vinext ──> API local ──> validação ──> AES-256-GCM ──> D1 local

Android
      └──> React / Vite ────> WebView ────> bridge Java
                                              ├──> Android Keystore
                                              ├──> arquivos cifrados
                                              └──> scanner ML Kit
```

No navegador, `GET /api/state` carrega o snapshot familiar e sua revisão.
`PUT /api/state` valida tipos, tamanhos, formatos e relacionamentos antes de
salvar. Uma revisão desatualizada recebe HTTP 409 para impedir sobrescrita
silenciosa.

No Android, a aplicação funciona offline. A WebView serve somente recursos
empacotados em `app.local`, e uma bridge nativa controla estado, documentos,
downloads e digitalização.

## Tecnologias

- TypeScript, React 19 e Next.js 16;
- Vinext, Vite 8 e Cloudflare Workers local;
- Drizzle ORM e D1 local;
- AES-256-GCM e Web Crypto;
- Java, Android WebView, Android Keystore e ML Kit;
- Node Test Runner, ESLint e TypeScript;
- GitHub Actions e Gitleaks.

## Persistência e segurança

### Navegador local

O snapshot é cifrado com AES-256-GCM usando `LOCAL_DATA_ENCRYPTION_KEY`. Hosts
não locais recebem `403`, escritas exigem mesma origem e o estado completo passa
por validação antes de chegar ao banco.

### Android

A chave AES é não exportável e fica no Android Keystore. Estado, fotos e PDFs
são cifrados antes da gravação. Backups do aplicativo estão desabilitados, e a
WebView bloqueia navegação externa, conteúdo misto e recursos fora da origem
local empacotada.

Nunca envie nomes, fotos, documentos ou informações médicas reais em commits,
issues, testes ou capturas públicas.

## Android

### Build de teste

[Baixe diretamente o `CuraFamilia-1.0.3-android-debug.apk`](https://github.com/ninex9x/cura-family/releases/download/v1.0.3-test.1/CuraFamilia-1.0.3-android-debug.apk)
e abra o arquivo em um aparelho Android para instalar e executar a aplicação.

Esse APK é uma build de teste, não uma versão de produção assinada. Depois de
instalado, o aplicativo funciona localmente no dispositivo Android e não usa um
backend hospedado.

### Compilar localmente

O projeto requer JDK 17 e Android SDK 34. No Windows:

```powershell
npm run android:apk
```

No Linux ou macOS:

```bash
npm run build:mobile
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon
```

O APK é criado em `android/app/build/outputs/apk/debug/app-debug.apk`, caminho
ignorado pelo Git.

## Estrutura do projeto

```text
.github/               CI e templates da comunidade
app/                   interface React e API local
db/                    acesso ao D1 local
docs/                  estudo de caso, roadmap e guia público
drizzle/               schema e migração idempotente
lib/                   domínio, validação e criptografia
mobile/                entrada Vite usada pelo Android
android/               WebView, Keystore e scanner nativos
scripts/               inicialização segura do ambiente local
tests/                 testes de domínio, renderização e cofre
worker/                entrada Vinext do servidor local
```

## Qualidade e automação

Cada push e pull request executa:

- instalação reproduzível com `npm ci`;
- typecheck e lint;
- testes e build web;
- build dos recursos mobile;
- compilação do APK Android;
- varredura completa do histórico com Gitleaks.

O repositório também mantém secret scanning, push protection, alertas de
dependências e relatos privados de vulnerabilidade habilitados no GitHub.

## Repositório público, aplicação local

O repositório é público, mas não possui GitHub Pages, homepage de demonstração
ou configuração de deploy. `.openai/hosting.json` declara apenas recursos usados
no desenvolvimento local e não contém `project_id`.

Essa separação permite avaliar arquitetura, qualidade e segurança sem oferecer
um serviço público para dados de saúde. O processo está detalhado no
[guia do projeto público](docs/GUIA_PROJETO_PUBLICO.md).

## Contribuindo

Use os templates de bug, melhoria e pull request. Antes de enviar uma mudança,
execute todos os comandos de validação e confirme que nenhum dado real, segredo,
banco ou artefato foi incluído. Veja [CONTRIBUTING.md](CONTRIBUTING.md).

Vulnerabilidades devem ser relatadas de forma privada conforme
[SECURITY.md](SECURITY.md), nunca em uma issue pública.

## Licença

Este repositório não possui licença de código aberto. A publicação permite
visualização e avaliação do projeto, mas não concede permissão automática para
copiar, modificar ou redistribuir o código.
